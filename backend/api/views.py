import os
import tempfile
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import LocationResultSerializer
from .utils import (
    extract_gps_from_exif,
    geolocate_image,
    validate_image_file,
    get_safe_filename
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    """
    Upload and process image for location extraction.
    
    Expected payload:
    - file: Image file (JPEG, PNG, WebP)
    
    Returns:
    - JSON with location data (EXIF or ML estimate)
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    file = request.FILES['file']
    
    # Validate file
    is_valid, error_message = validate_image_file(file)
    if not is_valid:
        return Response(
            {'error': error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create temporary file
    temp_dir = tempfile.mkdtemp()
    safe_filename = get_safe_filename(file.name)
    temp_path = os.path.join(temp_dir, safe_filename)
    
    try:
        # Save uploaded file to temporary location
        with open(temp_path, 'wb') as temp_file:
            for chunk in file.chunks():
                temp_file.write(chunk)
        
        # Try to extract EXIF GPS data first
        exif_result = extract_gps_from_exif(temp_path)
        
        if exif_result:
            # Return EXIF GPS data
            result = {
                'type': 'EXIF',
                'lat': exif_result['lat'],
                'lng': exif_result['lng'],
                'accuracy': exif_result['accuracy'],
                'source': exif_result['source'],
                'exif': exif_result['exif']
            }
        else:
            # Fall back to ML estimation
            estimate_result = geolocate_image(temp_path)
            result = {
                'type': 'ESTIMATE',
                'lat': estimate_result['lat'],
                'lng': estimate_result['lng'],
                'confidence': estimate_result['confidence'],
                'source': estimate_result['source']
            }
        
        # Validate result with serializer
        serializer = LocationResultSerializer(data=result)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid result format', 'details': serializer.errors},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        return Response(
            {'error': f'Processing failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    finally:
        # Clean up temporary file
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            os.rmdir(temp_dir)
        except OSError:
            pass  # Ignore cleanup errors


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint for monitoring.
    """
    return Response({'status': 'healthy'}, status=status.HTTP_200_OK)
