import os
import tempfile
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from PIL import Image
import json

from .utils import extract_gps_from_exif, dms_to_decimal, geolocate_image


class ImageProcessingTests(TestCase):
    """Test image processing utilities."""
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_dms_to_decimal_conversion(self):
        """Test DMS to decimal conversion."""
        from exifread.utils import Ratio
        
        # Test valid DMS conversion
        dms = [Ratio(40, 1), Ratio(42, 1), Ratio(30, 1)]  # 40°42'30"
        result = dms_to_decimal(dms, 'N')
        self.assertAlmostEqual(result, 40.7083, places=3)
        
        # Test with negative reference
        result = dms_to_decimal(dms, 'S')
        self.assertAlmostEqual(result, -40.7083, places=3)
        
        # Test with invalid input
        result = dms_to_decimal(None, 'N')
        self.assertIsNone(result)
    
    def test_geolocate_image_stub(self):
        """Test the geolocation stub function."""
        # Create a dummy file path
        dummy_path = os.path.join(self.temp_dir, 'test.jpg')
        
        # Test the stub function
        result = geolocate_image(dummy_path)
        
        # Verify result structure
        self.assertIn('lat', result)
        self.assertIn('lng', result)
        self.assertIn('confidence', result)
        self.assertIn('source', result)
        
        # Verify data types
        self.assertIsInstance(result['lat'], float)
        self.assertIsInstance(result['lng'], float)
        self.assertIsInstance(result['confidence'], float)
        self.assertEqual(result['source'], 'ESTIMATE')
        
        # Verify confidence range
        self.assertGreaterEqual(result['confidence'], 0.0)
        self.assertLessEqual(result['confidence'], 1.0)


class APITests(TestCase):
    """Test API endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create test user and token
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
    
    def create_test_image(self, filename='test.jpg'):
        """Create a test image file."""
        temp_dir = tempfile.mkdtemp()
        image_path = os.path.join(temp_dir, filename)
        
        # Create a simple test image
        image = Image.new('RGB', (100, 100), color='red')
        image.save(image_path, 'JPEG')
        
        return image_path, temp_dir
    
    def test_upload_endpoint_requires_auth(self):
        """Test that upload endpoint requires authentication."""
        client = APIClient()  # No credentials
        
        with tempfile.NamedTemporaryFile(suffix='.jpg') as temp_file:
            response = client.post('/api/upload/', {'file': temp_file})
            self.assertEqual(response.status_code, 401)
    
    def test_upload_missing_file(self):
        """Test upload endpoint with missing file."""
        response = self.client.post('/api/upload/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('No file provided', response.data['error'])
    
    def test_upload_invalid_file_type(self):
        """Test upload endpoint with invalid file type."""
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as temp_file:
            temp_file.write(b'This is not an image')
            temp_file.flush()
            
            with open(temp_file.name, 'rb') as f:
                response = self.client.post('/api/upload/', {'file': f})
            
            os.unlink(temp_file.name)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('not allowed', response.data['error'])
    
    def test_upload_large_file(self):
        """Test upload endpoint with oversized file."""
        # Create a large dummy file (simulate 11MB)
        large_content = b'x' * (11 * 1024 * 1024)
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            temp_file.write(large_content)
            temp_file.flush()
            
            with open(temp_file.name, 'rb') as f:
                response = self.client.post('/api/upload/', {'file': f})
            
            os.unlink(temp_file.name)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('exceeds', response.data['error'])
    
    def test_upload_valid_image(self):
        """Test upload endpoint with valid image."""
        image_path, temp_dir = self.create_test_image()
        
        try:
            with open(image_path, 'rb') as f:
                response = self.client.post('/api/upload/', {'file': f})
            
            self.assertEqual(response.status_code, 200)
            self.assertIn('type', response.data)
            self.assertIn('lat', response.data)
            self.assertIn('lng', response.data)
            
            # Should be ESTIMATE type since test image has no GPS
            self.assertEqual(response.data['type'], 'ESTIMATE')
            
        finally:
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)
    
    def test_health_check_endpoint(self):
        """Test health check endpoint."""
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'healthy')
