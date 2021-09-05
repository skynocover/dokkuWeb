import React from 'react';
import ReactDOM from 'react-dom';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';
import * as cookie from 'js-cookie';

import { DangerButton } from '../components/DangerButton';
import { AppContext } from '../AppContext';
import { AddProxy } from '../modals/AddProxy';
import { Notification } from '../components/Notification';

interface AppPageProp {
  appName: string;
}

const ProxyTable = ({ appName }: AppPageProp) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<PortMap[]>([]); //coulmns data
  const [enable, setEnable] = React.useState<boolean>(false);
  const [proxyType, setProxyType] = React.useState<string>('');

  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/proxy/${appName}`);
    const reports = data.report;

    const portmap: PortMap[] = [];
    for (const report of reports) {
      if (report.Key === 'Proxy enabled') {
        setEnable(report.Value === 'true');
      } else if (report.Key === 'Proxy type') {
        setProxyType(report.Value);
      } else if (report.Key === 'Proxy port map') {
        let v = report.Value.split(' ');
        for (const item of v) {
          let maps = item.split(':');
          if (maps.length === 3) {
            portmap.push({
              scheme: maps[0],
              hostPort: maps[1],
              containerPort: maps[2],
            });
          }
        }
      }
    }
    setDataSource(portmap);
  };

  React.useEffect(() => {
    initialize();
  }, []);

  interface PortMap {
    scheme: string;
    hostPort: string;
    containerPort: string;
  }

  const columns: ColumnsType<PortMap> = [
    {
      title: 'Scheme',
      align: 'center',
      dataIndex: 'scheme',
    },
    {
      title: 'HostPort',
      align: 'center',
      dataIndex: 'hostPort',
    },
    {
      title: 'ContainerPort',
      align: 'center',
      dataIndex: 'containerPort',
    },
    {
      title: 'Delete',
      align: 'center',
      render: (item) => (
        <DangerButton
          title="Delete Proxy"
          message="Confirm delete proxy?"
          onClick={async () => {
            let data = await appCtx.fetch('delete', `/api/proxy/${appName}`, {
              scheme: item.scheme,
              hostPort: item.hostPort,
              containerPort: item.containerPort,
            });
            if (data) {
              initialize();
            }
          }}
        />
      ),
    },
  ];

  const enableProxy = async () => {
    const check = enable ? 'disable' : 'enable';
    antd.Modal.confirm({
      title: `Confirm to ${check} proxy?`,
      icon: <i />,
      content: check,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const data = await appCtx.fetch(
          'patch',
          `/api/proxy/${appName}/${check}`,
        );
        if (data) {
          Notification.add('success', `Success ${check} proxy`);
          initialize();
        }
      },
    });
  };

  return (
    <>
      <div className="mb-2 d-flex flex-row-reverse">
        <antd.Button
          type="primary"
          onClick={() => {
            appCtx.setModal(
              <AddProxy onSuccess={initialize} appName={appName} />,
            );
          }}
        >
          Add Proxy
        </antd.Button>
      </div>
      <antd.Descriptions
        bordered
        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
      >
        <antd.Descriptions.Item label="Enable">
          <antd.Switch checked={enable} onChange={enableProxy} />
        </antd.Descriptions.Item>
        <antd.Descriptions.Item label="Proxy Type">
          {proxyType}
        </antd.Descriptions.Item>
      </antd.Descriptions>
      <div className="m-2" />
      <antd.Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </>
  );
};

export { ProxyTable };
