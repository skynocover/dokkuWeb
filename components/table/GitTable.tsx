import React from 'react';
import ReactDOM from 'react-dom';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';
import * as cookie from 'js-cookie';

import { AppContext } from '../AppContext';

interface AppPageProp {
  appName: string;
}

const GitTable = ({ appName }: AppPageProp) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<PropsValue[]>([]); //coulmns data

  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/git/${appName}`);
    const reports = data.report;

    const temp: PropsValue[] = [];
    for (const report of reports) {
      temp.push({
        key: report.Key,
        value: report.Value,
      });
    }
    setDataSource(temp);
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
  ];

  return (
    <>
      <antd.Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </>
  );
};

export { GitTable };
