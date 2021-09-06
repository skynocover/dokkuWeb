import express from 'express';
import multer from 'multer';
import { Resp } from '../../resp/resp';
import { client } from '../../utils/sshclient';
const routes = express.Router();

const mupload = multer();
const cpUpload = mupload.fields([{ name: 'files' }]);

routes.post('/ssh/upload', cpUpload, async (req, res) => {
  try {
    const files: any = req.files;
    if (!files) {
      res.status(400).json({ message: 'files format error' });
      return;
    }
    let file = files['files'];
    const key = file[0].buffer.toString();

    await client.initial(key);

    console.log(client.isInit());

    res.json(Resp.success);
  } catch (error: any) {
    res.json({ ...Resp.sqlExecFail, error: error.message });
  }
});

export { routes as ssh };
