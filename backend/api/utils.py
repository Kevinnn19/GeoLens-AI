"""
Utility functions for EXIF processing and geolocation.
"""
import os
import time
from typing import Dict, Any, Optional, Tuple
import exifread
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from exifread.utils import Ratio



def extract_gps_from_exif(image_path: str) -> Optional[Dict[str, Any]]:
    """
    Extract GPS coordinates from EXIF data.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary with GPS data or None if not found
    """
    try:
        # Try with exifread first
        with open(image_path, 'rb') as f:
            tags = exifread.process_file(f, details=False)
            
        print(f"DEBUG: Found EXIF tags: {list(tags.keys())}")  # Debug output
            
        # Check if GPS data exists
        gps_tags = [tag for tag in tags.keys() if tag.startswith('GPS')]
        print(f"DEBUG: GPS tags found: {gps_tags}")  # Debug output
        
        if not gps_tags:
            return None
            
        gps_data = {}
        for tag, value in tags.items():
            if tag.startswith('GPS'):
                gps_data[tag] = str(value)
        
        # Extract coordinates if available
        if 'GPS GPSLatitude' in tags and 'GPS GPSLongitude' in tags:
            lat_dms = tags['GPS GPSLatitude']
            lng_dms = tags['GPS GPSLongitude']
            lat_ref = tags.get('GPS GPSLatitudeRef', 'N')
            lng_ref = tags.get('GPS GPSLongitudeRef', 'E')
            
            print(f"DEBUG: Raw GPS data - Lat: {lat_dms} ({lat_ref}), Lng: {lng_dms} ({lng_ref})")  # Debug output
            
            lat = dms_to_decimal(lat_dms, lat_ref)
            lng = dms_to_decimal(lng_dms, lng_ref)
            
            print(f"DEBUG: Converted coordinates - Lat: {lat}, Lng: {lng}")  # Debug output
            
            if lat is not None and lng is not None:
                return {
                    'lat': lat,
                    'lng': lng,
                    'accuracy': 5,  # Default accuracy for EXIF GPS
                    'source': 'EXIF',
                    'exif': gps_data
                }
        
        # Try with Pillow as fallback
        from PIL import Image
        from PIL.ExifTags import TAGS, GPSTAGS
        
        image = Image.open(image_path)
        exif_data = image._getexif()
        
        if exif_data:
            for tag_id, value in exif_data.items():
                tag = TAGS.get(tag_id, tag_id)
                if tag == 'GPSInfo':
                    gps_info = {}
                    for gps_tag_id, gps_value in value.items():
                        gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                        gps_info[gps_tag] = gps_value
                    
                    print(f"DEBUG: Pillow GPS info: {gps_info}")  # Debug output
                    
                    if 'GPSLatitude' in gps_info and 'GPSLongitude' in gps_info:
                        lat_dms = gps_info['GPSLatitude']
                        lng_dms = gps_info['GPSLongitude']
                        lat_ref = gps_info.get('GPSLatitudeRef', 'N')
                        lng_ref = gps_info.get('GPSLongitudeRef', 'E')
                        
                        lat = dms_to_decimal(lat_dms, lat_ref)
                        lng = dms_to_decimal(lng_dms, lng_ref)
                        
                        if lat is not None and lng is not None:
                            return {
                                'lat': lat,
                                'lng': lng,
                                'accuracy': 5,
                                'source': 'EXIF',
                                'exif': gps_info
                            }
                            
    except Exception as e:
        print(f"Error extracting EXIF GPS data: {e}")
    
    return None


def dms_to_decimal(dms, ref) -> Optional[float]:
    """
    Convert degrees, minutes, seconds to decimal degrees.
    
    Args:
        dms: EXIF DMS format (e.g., [39, 28, 15.3])
        ref: Reference direction (N, S, E, W)
        
    Returns:
        Decimal degrees or None if conversion fails
    """
    try:
        if not dms or not ref:
            return None
            
        # Parse DMS format
        if hasattr(dms, 'values'):
            degrees = float(dms.values[0])
            minutes = float(dms.values[1])
            seconds = float(dms.values[2])
        else:
            # Handle string format
            dms_str = str(dms).strip('[]')
            parts = dms_str.split(',')
            if len(parts) != 3:
                return None
            degrees = float(parts[0].strip())
            minutes = float(parts[1].strip())
            seconds = float(parts[2].strip())
        
        decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
        
        # Apply reference direction
        if ref in ['S', 'W']:
            decimal = -decimal
            
        return decimal
    except (ValueError, IndexError, AttributeError) as e:
        print(f"Error converting DMS to decimal: {e}")
        return None


def geolocate_image(file_path: str) -> Dict[str, Any]:
    """
    Stub function for image geolocation using ML or external service.
    
    This is a placeholder function that simulates an async geolocation service.
    In production, this would be replaced with:
    - ML model inference (e.g., CLIP + location prediction)
    - External API call (e.g., Google Vision API, Azure Computer Vision)
    - Hybrid approach combining multiple signals
    
    Args:
        file_path: Path to the image file
        
    Returns:
        Dictionary with estimated location data
    """
    # Simulate processing time
    time.sleep(2)
    
    # Return error message instead of fake coordinates
    print("DEBUG: No GPS data found in image, falling back to estimation")
    
    return {
        'lat': 0.0,
        'lng': 0.0,
        'confidence': 0.0,
        'source': 'ESTIMATE',
        'error': 'No GPS data found in image. This is a placeholder - real AI estimation would analyze image content.'
    }


def validate_image_file(file) -> Tuple[bool, str]:
    """
    Validate uploaded image file.
    
    Args:
        file: Django UploadedFile object
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check file size (10 MB limit)
    if file.size > 10 * 1024 * 1024:
        return False, "File size exceeds 10 MB limit"
    
    # Check content type
    allowed_types = ['image/jpeg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        return False, f"File type {file.content_type} not allowed. Allowed types: {', '.join(allowed_types)}"
    
    # Check file header/magic bytes for security
    file.seek(0)
    header = file.read(8)
    file.seek(0)
    
    # JPEG magic bytes
    if header.startswith(b'\xff\xd8\xff'):
        return True, ""
    # PNG magic bytes
    elif header.startswith(b'\x89PNG\r\n\x1a\n'):
        return True, ""
    # WebP magic bytes
    elif header.startswith(b'RIFF') and b'WEBP' in header:
        return True, ""
    
    return False, "Invalid file format or corrupted file"


def get_safe_filename(filename: str) -> str:
    """
    Generate a safe filename for temporary storage.
    
    Args:
        filename: Original filename
        
    Returns:
        Safe filename with timestamp
    """
    import uuid
    import os
    
    # Get file extension
    _, ext = os.path.splitext(filename)
    
    # Generate unique filename
    safe_name = f"{uuid.uuid4()}{ext}"
    
    return safe_name
