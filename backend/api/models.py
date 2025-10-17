from django.db import models


class UploadResult(models.Model):
    """
    Model to store upload results for future reference.
    This is optional - you can use this to persist results
    or keep them ephemeral as specified in requirements.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    result_type = models.CharField(max_length=20, choices=[
        ('EXIF', 'EXIF GPS Data'),
        ('ESTIMATE', 'ML Estimate'),
    ])
    latitude = models.FloatField()
    longitude = models.FloatField()
    accuracy = models.FloatField(null=True, blank=True)
    confidence = models.FloatField(null=True, blank=True)
    exif_data = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.file_name} - {self.result_type} ({self.latitude}, {self.longitude})"
