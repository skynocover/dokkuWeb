import React from 'react';
import * as antd from 'antd';

import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { MainPage } from '../components/MainPage';
import { useRouter } from 'next/router';
import { ColumnsType } from 'antd/lib/table';
import { getSession } from 'next-auth/client';
import { UploadOutlined } from '@ant-design/icons';

import { Notification } from '../components/Notification';
import { prisma } from '../database/db';
import { AppContext } from '../components/AppContext';
import { DangerButton } from '../components/DangerButton';
import { AddService } from '../modals/AddService';
import { client } from '../utils/sshclient';

const Upload = ({ error }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const appCtx = React.useContext(AppContext);
  const router = useRouter();

  const props = {
    name: 'files',
    action: '/api/ssh/upload',

    async onChange(info: any) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        router.push('/');
        Notification.add('success', 'success upload!');
      } else if (info.file.status === 'error') {
        Notification.add('success', 'upload fail!');
      }
    },
  };
  return (
    <div className="d-flex align-items-center vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-4 m-4 text-center font-weight-bold" style={{ fontSize: '20px' }}>
            Please Upload SSH Key First
          </div>
        </div>

        <div className="m-5" />

        <div className="row justify-content-center">
          <antd.Upload {...props}>
            <antd.Button icon={<UploadOutlined />}>Click to Upload</antd.Button>
          </antd.Upload>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    const session = await getSession({ req });
    if (!session) {
      return {
        redirect: {
          permanent: false,
          destination: '/',
        },
        props: {},
      };
    }

    console.log('upload init');
    console.log(client.isInit());
    if (client.isInit()) {
      return {
        redirect: {
          permanent: false,
          destination: '/',
        },
        props: {},
      };
    }

    return { props: {} };
  } catch (error: any) {
    return { props: { error: error.message } };
  }
};

export default Upload;
