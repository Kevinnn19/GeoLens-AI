from rest_framework import serializers
from .models import UploadResult


class LocationResultSerializer(serializers.Serializer):
    """
    Serializer for location results from both EXIF and ML estimation.
    """
    type = serializers.CharField()
    lat = serializers.FloatField()
    lng = serializers.FloatField()
    accuracy = serializers.FloatField(required=False)
    confidence = serializers.FloatField(required=False)
    source = serializers.CharField()
    exif = serializers.DictField(required=False)


class UploadResultSerializer(serializers.ModelSerializer):
    """
    Serializer for persisted upload results.
    """
    class Meta:
        model = UploadResult
        fields = [
            'id', 'created_at', 'file_name', 'file_size',
            'result_type', 'latitude', 'longitude',
            'accuracy', 'confidence', 'exif_data'
        ]
        read_only_fields = ['id', 'created_at']
