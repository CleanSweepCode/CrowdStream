
STREAM_INGEST_ENDPOINT = "rtmps://6547df1ee2a7.global-contribute.live-video.net:443/app/"
STREAM_KEY = "sk_eu-west-1_bRbaU3zby2DA_BJwrule7EIvfnQc1ijHZJFbrSR4XtA"
RTMP_LOC = f"{STREAM_INGEST_ENDPOINT}/{STREAM_KEY}"

# Load video file to ffmpeg
import subprocess
import numpy as np
import argparse
from devices import get_webcam_name_windows, get_audio_name_windows

# check if device is windows or PC
import platform

class LiveStream(subprocess.Popen):
	def __init__(self, rtmp_loc, method='mp4', mp4_loc=''):

		self.rtmp_loc = rtmp_loc

		self.method = method

		if method == 'webcam':
			# Stream webcam
			if 'macos' in platform.platform().lower():
				cmd = self.cast_webcam_mac()
			else:
				cmd = self.cast_webcam_windows()

		elif method == 'mp4':
			cmd = self.cast_mp4(mp4_loc, num_loops=-1) # loop ball spinning indefinitely

		else:
			raise NotImplementedError(f"Method {method} not implemented.")

		super().__init__(cmd, stdin=subprocess.PIPE)

	def cast_webcam_mac(self, device_id = 0, audio_device_id=0, fps=30, width=640, height=480):
		return ["ffmpeg",
			"-f", "avfoundation",
		   "-video_size", f"{width}x{height}",
			"-framerate", f"{fps}",
			"-i", f"{device_id}:{audio_device_id}",
			"-c:v", "libx264",
			"-b:v", "6000K",
			"-maxrate", "6000K",
			"-pix_fmt", "yuv420p",
			"-r", "30",
			"-s", f"{width}x{height}",
			"-profile:v", "main",
			"-preset", "veryfast",
			"-g", "120",
			"-x264opts", "nal-hrd=cbr:no-scenecut",
			"-acodec", "aac",
			"-ab", "160k",
			"-ar", "44100",
			"-f", "flv",
			f"{self.rtmp_loc}"]

	def cast_webcam_windows(self, fps=30, width=640, height=480):
		return ["ffmpeg",
			"-f", "dshow",
		   "-video_size", f"{width}x{height}",
			"-framerate", f"{fps}",
			"-i", f"video={get_webcam_name_windows()}:audio={get_audio_name_windows()}",
			"-c:v", "libx264",
			# "-b:v", "6000K",
			# "-maxrate", "6000K",
			# "-rtbufsize", "2147.48M",
			# "-pix_fmt", "yuv420p",
			# "-r", "30",
			# "-s", f"{width}x{height}",
			# "-profile:v", "main",
			# "-preset", "veryfast",
			# "-g", "120",
			# "-x264opts", "nal-hrd=cbr:no-scenecut",
			# "-acodec", "aac",
			# "-ab", "160k",
			# "-ar", "44100",
			"-f", "flv",
			f"{self.rtmp_loc}"]

	def cast_mp4(self, mp4_loc, num_loops=-1):
		"""Take an MP4, stream to rtmp_loc.
		num_loops = -1 means loop indefinitely"""
		return ["ffmpeg",
				"-stream_loop", f"{num_loops}", # loop input indefinitely
				"-re", "-nostdin", "-i", f"{mp4_loc}",
				"-vcodec", "libx264", "-preset:v", "ultrafast", "-acodec", "aac", "-f", "flv",
				self.rtmp_loc]

	def cast_upload_frames(self):
		"""Set up stream that needs each frame cast to it from buffer"""
		raise NotImplementedError
		return ["ffmpeg",
				"-re", "-nostdin", "-i", "-",
				"-vcodec", "libx264", "-preset:v", "ultrafast", "-acodec", "aac", "-f", "flv",
				self.rtmp_loc]

	def write_frame(self, frame: np.ndarray):
		"""Write numpy frame to buffer"""
		self.stdin.write(frame.tobytes())

if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('--method', type=str, default='mp4', help='Method to use to stream video')
	parser.add_argument('--mp4_loc', type=str, default='video_uploading/ball-spinning.mp4', help='If `method` is mp4, location of mp4 file to stream')

	args = parser.parse_args()

	livestream = LiveStream(RTMP_LOC, method=args.method, mp4_loc = args.mp4_loc)
	livestream.wait() # loading video from another source, wait for stream (CTRL-C to force exit)



