export const RESOLUTIONS = [
  { height: 1080, name: '1080p' },
  { height: 480, name: '480p' },
  { height: 144, name: '144p' },
  { height: 240, name: '240p' },
  { height: 360, name: '360p' },
  { height: 720, name: '720p' },
];
export const COMPRESSION_OPTIONS = ['-c:v libx264', '-preset fast', '-crf 27', '-c:a aac', '-b:a 128k'];

export const HLS_OPTIONS = [
  '-force_key_frames',
  'expr:gte(t,n_forced*2)',
  '-f hls',
  '-hls_time 2',
  '-hls_flags independent_segments',
  '-hls_list_size 0',
  '-hls_playlist_type vod',
  '-hls_segment_type mpegts',
];
