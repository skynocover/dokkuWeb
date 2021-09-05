import React from 'react';
import ReactDOM from 'react-dom';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';

import { PrimaryButton } from '../components/PrimaryButton';
import { AppContext } from '../AppContext';
import { Notification } from '../components/Notification';

const AddProxy = ({
  onSuccess,
  appName,
}: {
  onSuccess: Function;
  appName: string;
}) => {
  const appCtx = React.useContext(AppContext);

  React.useEffect(() => {}, []);

  const onFinish = async (values: any) => {
    appCtx.setModal(null);

    const data = await appCtx.fetch('post', `/api/proxy/${appName}`, {
      scheme: values.scheme,
      hostPort: values.hostPort,
      containerPort: values.containerPort,
    });

    if (data) {
      Notification.add('success', 'Success Add');
      onSuccess();
    }
  };

  return (
    <antd.Form onFinish={onFinish}>
      <h5 className="font-weight-bold mb-4">Add Proxy</h5>

      <antd.Form.Item
        name="scheme"
        rules={[{ required: true, message: 'Input scheme' }]}
      >
        <antd.Input
          prefix={<i className="fa fa-shield" />}
          placeholder="Please input scheme"
        />
      </antd.Form.Item>

      <antd.Form.Item
        name="hostPort"
        rules={[{ required: true, message: 'Input host port' }]}
      >
        <antd.Input
          prefix={<i className="fa fa-hand-o-down" />}
          placeholder="Please input host port"
        />
      </antd.Form.Item>

      <antd.Form.Item
        name="containerPort"
        rules={[{ required: true, message: 'Input container port' }]}
      >
        <antd.Input
          prefix={<i className="fa fa-hand-o-up" />}
          placeholder="Please input container port"
        />
      </antd.Form.Item>

      <antd.Form.Item className="text-center">
        <PrimaryButton title="Add" htmlType="submit" />
      </antd.Form.Item>
    </antd.Form>
  );
};

export { AddProxy };
