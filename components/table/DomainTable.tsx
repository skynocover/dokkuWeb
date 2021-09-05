import React from 'react';
import ReactDOM from 'react-dom';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';
import * as cookie from 'js-cookie';

import { DangerButton } from '../components/DangerButton';
import { AppContext } from '../AppContext';
import { AddDomain } from '../modals/AddDomain';

interface AppPageProp {
  appName: string;
}

const DomainTable = ({ appName }: AppPageProp) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<Host[]>([]); //coulmns data
  const [enable, setEnable] = React.useState<boolean>(false);

  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/domain/${appName}`);
    const reports = data.report;

    let hosts: Host[] = [];
    for (const report of reports) {
      if (report.Key === 'Domains app enabled') {
        setEnable(report.Value === 'true');
      } else if (report.Key === 'Domains app vhosts') {
        const vhosts = report.Value.split(' ');
        for (const host of vhosts) {
          if (host !== '') {
            hosts.push({ host });
          }
        }
      }
    }
    setDataSource(hosts);
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
            let data = await appCtx.fetch('delete', `/api/domain/${appName}`, [
              item.host,
            ]);
            if (data) initialize();
          }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-2 d-flex flex-row-reverse">
        <antd.Button
          type="primary"
          onClick={() => {
            appCtx.setModal(
              <AddDomain onSuccess={initialize} appName={appName} />,
            );
          }}
        >
          Add Domain
        </antd.Button>
      </div>
      <antd.Descriptions
        bordered
        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
      >
        <antd.Descriptions.Item label="Enable">
          <antd.Switch checked={enable} />
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

export { DomainTable };
