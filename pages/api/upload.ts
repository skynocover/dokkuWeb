import type { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '../../database/db';
import { Resp, Tresp } from '../../resp/resp';
import { client } from '../../utils/sshclient';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function postSerivce() {
    try {
      const uploadfile: string = req.body;

      const sf = uploadfile.split('\n');
      let check = false;
      let file = '';
      for (const item of sf) {
        if (item.includes('BEGIN OPENSSH PRIVATE KEY')) {
          check = true;
          file += item + '\n';
        } else if (item.includes('END OPENSSH PRIVATE KEY')) {
          check = false;
          file += item + '\n';
        } else if (check) {
          file += item + '\n';
        }
      }

      console.log(file);
      await client.initial(file);

      console.log(client.isInit());

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  async function deleteService() {
    try {
      const id = +req.query.id;
      if (isNaN(id)) {
        res.json(Resp.paramInputFormateError);
        return;
      }

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.sqlExecFail });
    }
  }

  switch (req.method) {
    case 'POST':
      return await postSerivce();
    case 'DELETE':
      return await deleteService();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
