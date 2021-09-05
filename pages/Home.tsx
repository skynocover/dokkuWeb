import React from 'react';
import * as antd from 'antd';

import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { MainPage } from '../components/MainPage';
import { useRouter } from 'next/router';
import { ColumnsType } from 'antd/lib/table';
import { getSession } from 'next-auth/client';

import { Notification } from '../components/Notification';
import { prisma } from '../database/db';
import { AppContext, service } from '../components/AppContext';
import { DangerButton } from '../components/DangerButton';
import { AddService } from '../modals/AddService';
import { client } from '../utils/sshclient';
import { AddApp } from '../modals/AddApp';
import { DatabasesTalbe } from '../components/table/DatabasesTalbe';

const Home = ({ error }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const appCtx = React.useContext(AppContext);

  const initialize = async () => {};

  React.useEffect(() => {
    initialize();
  }, []);

  const operations = (
    <antd.Button
      type="primary"
      onClick={() => {
        appCtx.setModal(<AddApp />);
      }}
    >
      Add new App
    </antd.Button>
  );

  const content = (
    <>
      <antd.Tabs defaultActiveKey="domain" tabBarExtraContent={operations}>
        <antd.Tabs.TabPane tab="Global Domain" key="domain">
          <DomainTable />
        </antd.Tabs.TabPane>

        <antd.Tabs.TabPane tab="Global Config" key="config">
          <ConfigTable />
        </antd.Tabs.TabPane>

        <antd.Tabs.TabPane tab="Database" key="database">
          <DatabasesTalbe />
        </antd.Tabs.TabPane>
      </antd.Tabs>
    </>
  );

  return <MainPage content={content} menuKey="Home" />;
};

const GlobalPage = () => {};

const ConfigTable = () => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<PropsValue[]>([]); //coulmns data
  const [restart, setRestart] = React.useState<boolean>(true);

  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/globalconfig`);
    if (data) {
      const reports = data.report;
      const temp: PropsValue[] = [];
      for (const report of reports) {
        temp.push({
          key: report.Key,
          value: report.Value,
        });
      }
      setDataSource(temp);
    }
  };

  React.useEffect(() => {
    initialize();
  }, []);

  interface PropsValue {
    key: string;
    value: string;
  }

  const columns: ColumnsType<PropsValue> = [
    {
      title: 'Key',
      align: 'center',
      dataIndex: 'key',
    },
    {
      title: 'Value',
      align: 'center',
      dataIndex: 'value',
    },
    {
      title: 'Delete',
      align: 'center',
      render: (item) => (
        <DangerButton
          title="Delete"
          message="Confirm delete config key?"
          onClick={async () => {
            let data = await appCtx.fetch(
              'delete',
              `/api/globalconfig/${item.key}?restart=${restart}`,
            );
            if (data) {
              initialize();
            }
          }}
        />
      ),
    },
  ];

  const AddConfig = ({ onSuccess }: { onSuccess: Function }) => {
    const appCtx = React.useContext(AppContext);

    React.useEffect(() => {}, []);

    const onFinish = async (values: any) => {
      appCtx.setModal(null);

      const data = await appCtx.fetch('post', `/api/globalconfig`, {
        restart: restart,
        config: [{ key: values.key, value: values.value }],
      });

      if (data) {
        Notification.add('success', 'Success Add');
        onSuccess();
      }
    };

    return (
      <antd.Form onFinish={onFinish}>
        <h5 className="font-weight-bold mb-4">Add Config</h5>

        <antd.Form.Item label="Key" name="key" rules={[{ required: true, message: 'Input key' }]}>
          <antd.Input prefix={<i className="fa fa-key" />} placeholder="Please input key" />
        </antd.Form.Item>

        <antd.Form.Item
          label="Value"
          name="value"
          rules={[{ required: true, message: 'Input value' }]}
        >
          <antd.Input
            prefix={<i className="fa fa-folder-open" />}
            placeholder="Please input value"
          />
        </antd.Form.Item>

        <antd.Form.Item className="text-center">
          <antd.Button htmlType="submit">Add</antd.Button>
        </antd.Form.Item>
      </antd.Form>
    );
  };

  return (
    <>
      <div className="mb-2 d-flex ">
        <div className="mx-1">Restart After Change</div>
        <antd.Switch checked={restart} onChange={setRestart} />
        <div className="flex-fill"></div>
        <antd.Button
          type="primary"
          onClick={() => {
            appCtx.setModal(<AddConfig onSuccess={initialize} />);
          }}
        >
          Add Config
        </antd.Button>
      </div>
      <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
    </>
  );
};

const DomainTable = () => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<Host[]>([]); //coulmns data

  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/globaldomain`);
    if (data) {
      const reports = data.report;

      let hosts: Host[] = [];
      for (const report of reports) {
        if (report.Key === 'Domains global vhosts') {
          const vhosts = report.Value.split(' ');
          for (const host of vhosts) {
            if (host !== '') {
              hosts.push({ host });
            }
          }
        }
      }

      if (hosts.length > 0) {
        // appCtx.setGlobalDomain(hosts[0].host);
      }
      setDataSource(hosts);
    }
  };

  React.useEffect(() => {
    initialize();
  }, []);

  interface Host {
    host: string;
  }

  const columns: ColumnsType<Host> = [
    {
      title: 'Host',
      align: 'center',
      dataIndex: 'host',
    },
    {
      title: 'Delete',
      align: 'center',
      render: (item) => (
        <DangerButton
          title="Delete Domain"
          message="Confirm delete domain?"
          onClick={async () => {
            let data = await appCtx.fetch('delete', `/api/globaldomain/${item.host}`, [item.host]);
            if (data) initialize();
          }}
        />
      ),
    },
  ];

  const AddDomain = ({ onSuccess }: { onSuccess: Function }) => {
    const appCtx = React.useContext(AppContext);

    React.useEffect(() => {}, []);

    const onFinish = async (values: any) => {
      appCtx.setModal(null);

      const data = await appCtx.fetch('post', `/api/globaldomain`, [values.domain]);

      if (data) {
        Notification.add('success', 'Success Add');
        onSuccess();
      }
    };

    return (
      <antd.Form onFinish={onFinish}>
        <h5 className="font-weight-bold mb-4">Add Domain</h5>

        <antd.Form.Item name="domain" rules={[{ required: true, message: 'Input domain' }]}>
          <antd.Input prefix={<i className="fa fa-user" />} placeholder="Please input domain" />
        </antd.Form.Item>

        <antd.Form.Item className="text-center">
          <antd.Button htmlType="submit">Add</antd.Button>
        </antd.Form.Item>
      </antd.Form>
    );
  };

  return (
    <>
      <div className="mb-2 d-flex flex-row-reverse">
        <antd.Button
          type="primary"
          onClick={() => {
            appCtx.setModal(<AddDomain onSuccess={initialize} />);
          }}
        >
          Add Domain
        </antd.Button>
      </div>
      <div className="m-2" />
      <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
    </>
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

    // const services = await prisma.service.findMany({
    //   select: { id: true, name: true, domain: true, port: true },
    // });
    return { props: {} };
  } catch (error: any) {
    return { props: { error: error.message } };
  }
};

export default Home;
