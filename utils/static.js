import LiveDirectory from 'live-directory';
import * as handler from './handler.js';

// Create LiveDirectory instance with static files
const stat = new LiveDirectory('static', {
  filter: {
    keep: {
      extensions: ['css', 'js', 'ttf', 'png', 'jpg', 'jpeg', 'ico']
    },
    ignore: (path) => {
      return path.startsWith('.');
    },
  },
  cache: {
    max_file_count: 250,
    max_file_size: 1024 * 1024,
  },
});

// Serve assets from static directory
export function serve(req, res) {
  const path = req.path.replace('/static', '');
  const file = stat.get(path);

  if (file === undefined) {
    handler.setStatus(res, 404);
    handler.setInfo('err', "Resource not found!");
    return handler.sendError(res);
  }

  handler.setInfo('file', file.path);

  const fileParts = file.path.split(".");
  const extension = fileParts[fileParts.length - 1];

  const content = file.content;
  if (content instanceof Buffer) {
    return res.type(extension).send(content);
  }
  else {
    return res.type(extension).stream(content);
  }
}
