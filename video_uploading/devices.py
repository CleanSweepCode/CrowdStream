import subprocess
import re
import ffmpeg

def get_webcam_name_windows():
    # Run FFmpeg command to list DirectShow devices
    command = "ffmpeg -list_devices true -f dshow -i dummy"
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)

    # Define regex patterns to match video devices and webcam devices
    device_pattern = re.compile(r'\[dshow @ \w+\] "(.*)"')

    webcam_pattern = re.compile(r'camera', re.IGNORECASE)

    # Iterate through lines of the output
    for line in result.stderr.split('\n'):
        # Check if the line matches a video device pattern
        device_match = device_pattern.search(line)
        if device_match:
            device_name = device_match.group(1)
            if webcam_pattern.search(device_name):
                return device_name

    # If no matching device is found
    return None


def get_audio_name_windows():
    # Run FFmpeg command to list DirectShow devices
    command = "ffmpeg -list_devices true -f dshow -i dummy"
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)

    # Define regex patterns to match video devices and webcam devices
    device_pattern = re.compile(r'\[dshow @ \w+\] "(.*)"')

    webcam_pattern = re.compile(r'(audio|microphone)', re.IGNORECASE)

    # Iterate through lines of the output
    for line in result.stderr.split('\n'):
        # Check if the line matches a video device pattern
        device_match = device_pattern.search(line)
        if device_match:
            device_name = device_match.group(1)
            if webcam_pattern.search(device_name):
                return device_name

    # If no matching device is found
    return None


webcam_device_name = get_webcam_name_windows()
audio_device_name = get_audio_name_windows()

if webcam_device_name:
    print(f"Webcam device name: {webcam_device_name}")
else:
    
    print("No webcam device found.")

if audio_device_name:
    print(f"Audio device name: {audio_device_name}")
else:
    print("No audio device found.")
