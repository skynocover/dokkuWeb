import React from 'react';
import ReactDOM from 'react-dom';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';
import * as cookie from 'js-cookie';

import Ansi from 'ansi-to-react';
import { DangerButton } from '../components/DangerButton';
import { AppContext } from '../AppContext';
import { AddProxy } from '../modals/AddProxy';
import { Notification } from '../components/Notification';
import { PrimaryButton } from '../components/PrimaryButton';

interface AppPageProp {
  appName: string;
}

const Log = ({ appName }: AppPageProp) => {
  const appCtx = React.useContext(AppContext);
  const [dataSource, setDataSource] = React.useState<string[]>([]); //coulmns data
  const [num, setNum] = React.useState<number>(10);

  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/logs/${appName}/${num}`);

    if (data) {
      setDataSource(data.report.split('\n'));
    }
  };

  React.useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <div>
        <antd.InputNumber
          min={1}
          defaultValue={num}
          onChange={(number) => {
            // @ts-ignore
            setNum(number);
          }}
        />
        <PrimaryButton title={`Show ${num} of logs`} onClick={initialize} />
      </div>
      <antd.Typography>
        <antd.Typography.Title>{`${appName} LOG`}</antd.Typography.Title>
        {dataSource.map((item) => (
          <antd.Typography.Paragraph>
            <Ansi>{item}</Ansi>
          </antd.Typography.Paragraph>
        ))}
      </antd.Typography>
    </>
  );
};

export { Log };
