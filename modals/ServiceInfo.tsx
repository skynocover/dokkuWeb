import React from 'react';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';

import { AppContext } from '../components/AppContext';
import { Notification } from '../components/Notification';

export const ServiceInfo = ({
  databaseName,
  serviceName,
}: {
  databaseName: string;
  serviceName: string;
}) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<info[]>([]);
  const [status, setStatus] = React.useState<boolean>(false);
  const [spinning, setSpinning] = React.useState<boolean>(false);

  interface info {
    key: string;
    value: string;
  }
  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/dbservice/${databaseName}/${serviceName}`);
    if (data) {
      for (const i of data.info) {
        if (i.Key === 'Status') {
          setStatus(i.Value === 'running');
        }
      }
      setDataSource(data.info);
    }
  };

  React.useEffect(() => {
    initialize();
  }, []);

  const columns: ColumnsType<info> = [
    {
      title: 'Key',
      align: 'center',
      dataIndex: 'Key',
    },
    {
      title: 'Value',
      align: 'center',
      dataIndex: 'Value',
    },
  ];

  return (
    <>
      <antd.Spin spinning={spinning}>
        <div className="mb-2 d-flex ">
          <antd.Button
            type="primary"
            onClick={async () => {
              setSpinning(true);
              const data = await appCtx.fetch('patch', '/api/dbservice', {
                database: databaseName,
                service: serviceName,
                start: status ? 'stop' : 'start',
              });
              if (data) initialize();
              setSpinning(false);
            }}
          >
            {status ? 'stop' : 'start'}
          </antd.Button>
          {status && (
            <antd.Button
              type="primary"
              onClick={async () => {
                setSpinning(true);
                const data = await appCtx.fetch('patch', '/api/dbservice', {
                  database: databaseName,
                  service: serviceName,
                  start: 'restart',
                });
                if (data) initialize();
                setSpinning(false);
              }}
            >
              restart
            </antd.Button>
          )}
        </div>
        <antd.Table dataSource={dataSource} columns={columns} pagination={false} />
      </antd.Spin>
    </>
  );
};
