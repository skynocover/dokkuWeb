import React from 'react';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';

import { AppContext } from '../AppContext';
import { DangerButton } from '../DangerButton';
import { ServiceInfo } from '../../modals/ServiceInfo';
import { AddService } from '../../modals/AddService';
import { LinkList } from '../../modals/LinkList';

interface database {
  name: string;
  installed: boolean;
  enabled: boolean;
}

interface spin {
  tip?: string;
  spinning: boolean;
}

export const DatabasesTalbe = () => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<database[]>([]);
  const [spinning, setSpinning] = React.useState<spin>({ spinning: false });

  const initialize = async () => {
    setSpinning({ spinning: true });
    const data = await appCtx.fetch('get', '/api/databases');
    if (data) {
      console.log(data);
      setDataSource(data.databases);
    }
    setSpinning({ spinning: false });
  };

  React.useEffect(() => {
    initialize();
  }, []);

  const enableDatabase = async (item: database, checked: boolean) => {
    setSpinning({
      spinning: true,
      tip: checked ? `enable ${item.name}` : `disable ${item.name}`,
    });
    const data = await appCtx.fetch(
      'patch',
      `/api/database/${item.name}/${checked ? 'enable' : 'disable'}`,
    );
    setSpinning({ spinning: false });
    if (data) initialize();
  };

  return (
    <>
      <antd.Spin tip={spinning.tip} spinning={spinning.spinning}>
        <antd.Tabs defaultActiveKey="database">
          <antd.Tabs.TabPane tab="Database List" key="databaseList">
            <Databases
              databases={dataSource}
              setSpinning={setSpinning}
              enableDatabase={enableDatabase}
            />
          </antd.Tabs.TabPane>
          {dataSource.map((item) => {
            return (
              <antd.Tabs.TabPane tab={item.name} key={item.name}>
                <Service serviceName={item.name} />
              </antd.Tabs.TabPane>
            );
          })}
        </antd.Tabs>
      </antd.Spin>
    </>
  );
};

const Service = ({ serviceName }: { serviceName: string }) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<service[]>([]);

  interface service {
    name: string;
  }
  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/dbservice/${serviceName}`);
    if (data) {
      setDataSource(
        data.services.map((item: string) => {
          return { name: item };
        }),
      );
    }
  };

  React.useEffect(() => {
    initialize();
  }, []);

  const columns: ColumnsType<service> = [
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: '',
      align: 'center',
      render: (item) => (
        <antd.Button
          onClick={() => {
            appCtx.setModal(
              <ServiceInfo databaseName={serviceName} serviceName={item.name} />,
              800,
            );
          }}
        >
          Info
        </antd.Button>
      ),
    },
    {
      title: '',
      align: 'center',
      render: (item) => (
        <antd.Button
          onClick={() => {
            appCtx.setModal(<LinkList databaseName={serviceName} serviceName={item.name} />);
          }}
        >
          Link List
        </antd.Button>
      ),
    },
  ];

  return (
    <>
      <div className="mb-2 d-flex flex-row-reverse">
        <antd.Button
          type="primary"
          onClick={() => {
            appCtx.setModal(<AddService />);
          }}
        >
          Add Service
        </antd.Button>
      </div>
      <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
    </>
  );
};

const Databases = ({
  databases,
  setSpinning,
  enableDatabase,
}: {
  databases: database[];
  setSpinning: (value: React.SetStateAction<spin>) => void;
  enableDatabase: (item: database, checked: boolean) => Promise<void>;
}) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<database[]>([]);

  React.useEffect(() => {
    initialize();
  }, [databases]);

  const initialize = async () => {
    let setDB = [...allDatabases];
    for (const d of databases) {
      for (const dd of setDB) {
        if (d.name === dd.name) {
          dd.installed = true;
          dd.enabled = d.enabled;
        }
      }
    }
    setDataSource(setDB);
  };

  const allDatabases: database[] = [
    {
      name: 'postgres',
      installed: false,
      enabled: false,
    },
    {
      name: 'mariadb',
      installed: false,
      enabled: false,
    },
    {
      name: 'mongo',
      installed: false,
      enabled: false,
    },
    {
      name: 'redis',
      installed: false,
      enabled: false,
    },
    {
      name: 'mysql',
      installed: false,
      enabled: false,
    },
  ];

  const columns: ColumnsType<database> = [
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: 'Enable',
      align: 'center',
      render: (item) => (
        <antd.Switch
          disabled={!item.installed}
          checked={item.enabled}
          onChange={(checked) => {
            enableDatabase(item, checked);
          }}
        ></antd.Switch>
      ),
    },
    {
      title: 'Installed',
      align: 'center',
      render: (item) =>
        item.installed ? (
          <DangerButton
            title="Uninstall"
            message={`Uninstall ${item.name}`}
            onClick={async () => {
              let data = await appCtx.fetch('delete', `/api/database/${item.name}`);
              if (data) {
                initialize();
              }
            }}
          />
        ) : (
          <antd.Button
            type="primary"
            onClick={async () => {
              setSpinning({ spinning: true, tip: `Installing ${item.name}` });

              let data = await appCtx.fetch('post', `/api/database/${item.name}`);
              setSpinning({ spinning: false });
              if (data) initialize();
            }}
          >
            Install
          </antd.Button>
        ),
    },
  ];

  return (
    <>
      <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
    </>
  );
};
