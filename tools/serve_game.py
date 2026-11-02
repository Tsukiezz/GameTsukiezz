"""Serve the local game with enough pending slots for its parallel asset loads."""
import argparse
import functools
import http.server
from pathlib import Path

http.server.ThreadingHTTPServer.request_queue_size = 128
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parents[1] / 'demo'))
parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8765)
args = parser.parse_args()
http.server.ThreadingHTTPServer(('127.0.0.1', args.port), handler).serve_forever()
