import React from 'react';
import ReactDOM from 'react-dom';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';
import * as cookie from 'js-cookie';
import {
  HighlightOutlined,
  SmileOutlined,
  SmileFilled,
} from '@ant-design/icons';

import { AppContext } from '../AppContext';

interface AppPageProp {
  appName: string;
}

const ReportTable = ({ appName }: AppPageProp) => {
  const appCtx = React.useContext(AppContext);
  const [lock, setLock] = React.useState<boolean>(false);
  const [appDir, setAppDir] = React.useState<string>('');
  const [DeploySource, setDeploySource] = React.useState<string>('');

  const initialize = async () => {
    const data = await appCtx.fetch('get', `/api/app/${appName}`);
    if (data) {
      const reports = data.report;

      for (const report of reports) {
        if (report.Key === 'App locked') {
          setLock(report.Value === 'true');
        } else if (report.Key === 'App dir') {
          setAppDir(report.Value);
        } else if (report.Key === 'App deploy source') {
          setDeploySource(report.Value);
        }
      }
    }
  };

  React.useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <antd.Descriptions bordered column={{ sm: 2, xs: 1 }}>
        <antd.Descriptions.Item label="Lock">
          <antd.Switch checked={lock} />
        </antd.Descriptions.Item>
        <antd.Descriptions.Item label="App dir">
          {appDir}
        </antd.Descriptions.Item>
        <antd.Descriptions.Item label="App deploy source">
          {DeploySource}
        </antd.Descriptions.Item>
        <antd.Descriptions.Item label="Git remote Add">
          <antd.Typography.Paragraph copyable>
            {`git remote add ${appName} dokku@${appCtx.globalDomain}:${appName}`}
          </antd.Typography.Paragraph>
        </antd.Descriptions.Item>
      </antd.Descriptions>
    </>
  );
};

export { ReportTable };
