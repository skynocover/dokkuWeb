import React from 'react';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';

import { DangerButton } from '../components/DangerButton';
import { AppContext } from '../components/AppContext';
import { Notification } from '../components/Notification';

export const LinkList = ({
  databaseName,
  serviceName,
}: {
  databaseName: string;
  serviceName: string;
}) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<link[]>([]);
  const [appName, setAppName] = React.useState<string>('');
  const [spinning, setSpinning] = React.useState<boolean>(false);

  interface link {
    appName: string;
  }
  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/dblinks/${databaseName}/${serviceName}`);
    if (data) {
      setDataSource(
        data.links.map((item: string) => {
          return { appName: item };
        }),
      );
    }
  };

  React.useEffect(() => {
    initialize();
  }, []);

  const columns: ColumnsType<link> = [
    {
      title: 'App Name',
      align: 'center',
      dataIndex: 'appName',
    },
    {
      title: '',
      align: 'center',
      render: (item) => (
        <DangerButton
          title="Unlink"
          message={`Unlink ${item.appName}`}
          onClick={async () => {
            setSpinning(true);
            const data = await appCtx.fetch('post', '/api/dblink', {
              database: databaseName,
              service: serviceName,
              appName: item.appName,
              link: false,
            });
            if (data) initialize();
            setSpinning(false);
          }}
        />
      ),
    },
  ];

  const handleChange = (value: string) => {
    setAppName(value);
  };

  return (
    <>
      <antd.Spin spinning={spinning}>
        <div className="mb-2 d-flex ">
          {/* <antd.Select style={{ width: 120 }} onChange={handleChange}>
            {appCtx.appNames.map((item) => {
              return <antd.Select.Option value={item}>{item}</antd.Select.Option>;
            })}
          </antd.Select> */}
          <antd.Button
            type="primary"
            onClick={async () => {
              setSpinning(true);
              const data = await appCtx.fetch('post', '/api/dblink', {
                database: databaseName,
                service: serviceName,
                appName: appName,
                link: true,
              });
              if (data) initialize();
              setSpinning(false);
            }}
          >
            Add Link
          </antd.Button>
        </div>
        <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
      </antd.Spin>
    </>
  );
};
