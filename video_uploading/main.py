
STREAM_INGEST_ENDPOINT = "rtmps://6547df1ee2a7.global-contribute.live-video.net:443/app/"
STREAM_KEY = "sk_eu-west-1_bRbaU3zby2DA_BJwrule7EIvfnQc1ijHZJFbrSR4XtA"
RTMP_LOC = f"{STREAM_INGEST_ENDPOINT}/{STREAM_KEY}"

# Load video file to ffmpeg
import subprocess
import cv2
import numpy as np

class LiveStream(subprocess.Popen):
	def __init__(self, rtmp_loc, method='cast_mp4'):

		self.rtmp_loc = rtmp_loc

		self.method = method

		if method == 'cast_webcam':
			cmd = self.cast_webcam() # Stream webcam

		elif method == 'cast_mp4':
			cmd = self.cast_mp4('ball-spinning.mp4', num_loops=-1) # loop ball spinning indefinitely

		elif method == 'write_live':
			cmd = self.cast_upload_frames()

		else:
			raise NotImplementedError

		super().__init__(cmd, stdin=subprocess.PIPE)

	def cast_webcam(self, device_id = 0, audio_device_id=0, fps=30, width=640, height=480):
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


livestream = LiveStream(RTMP_LOC, method='cast_webcam')

if livestream.method != 'write_live':
	livestream.wait() # loading video from another source, wait for stream (CTRL-C to force exit)

else:
	# write frame at a time
	while 1: # infinite loop
		img = np.random.uniform(0, 255, (400, 400, 3)).astype(np.uint8)
		livestream.write_frame(img)



