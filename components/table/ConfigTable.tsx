import React from 'react';
import ReactDOM from 'react-dom';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';
import * as cookie from 'js-cookie';

import { DangerButton } from '../components/DangerButton';
import { AppContext } from '../AppContext';
import { AddConfig } from '../modals/AddConfig';

interface AppPageProp {
  appName: string;
}

const ConfigTable = ({ appName }: AppPageProp) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<PropsValue[]>([]); //coulmns data
  const [restart, setRestart] = React.useState<boolean>(true);

  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/config/${appName}`);
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
      width: 600,
      render: (item) => (
        <div style={{ wordWrap: 'break-word', width: 600 }}>{item}</div>
      ),
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
              `/api/config/${appName}/${item.key}?restart=${restart}`,
            );
            if (data) {
              initialize();
            }
          }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-2 d-flex ">
        <div className="mx-1">Restart After Change</div>
        <antd.Switch checked={restart} onChange={setRestart} />
        <div className="flex-fill"></div>
        <antd.Button
          type="primary"
          onClick={() => {
            appCtx.setModal(
              <AddConfig
                onSuccess={initialize}
                appName={appName}
                restart={restart}
              />,
            );
          }}
        >
          Add Config
        </antd.Button>
      </div>
      <antd.Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </>
  );
};

export { ConfigTable };
