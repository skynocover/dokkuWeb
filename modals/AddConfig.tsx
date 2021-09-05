import React from 'react';
import ReactDOM from 'react-dom';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';

import { PrimaryButton } from '../components/PrimaryButton';
import { AppContext } from '../AppContext';
import { Notification } from '../components/Notification';

const AddConfig = ({
  onSuccess,
  appName,
  restart,
}: {
  onSuccess: Function;
  appName: string;
  restart: boolean;
}) => {
  const appCtx = React.useContext(AppContext);

  React.useEffect(() => {}, []);

  const onFinish = async (values: any) => {
    appCtx.setModal(null);

    const data = await appCtx.fetch('post', `/api/config/${appName}`, {
      restart: restart,
      config: [{ key: values.key, value: values.value }],
    });

    if (data) {
      Notification.add('success', 'Success Add');
      onSuccess();
    }
  };

  return (
    <antd.Form onFinish={onFinish}>
      <h5 className="font-weight-bold mb-4">Add Config</h5>

      <antd.Form.Item
        label="Key"
        name="key"
        rules={[{ required: true, message: 'Input key' }]}
      >
        <antd.Input
          prefix={<i className="fa fa-key" />}
          placeholder="Please input key"
        />
      </antd.Form.Item>

      <antd.Form.Item
        label="Value"
        name="value"
        rules={[{ required: true, message: 'Input value' }]}
      >
        <antd.Input
          prefix={<i className="fa fa-folder-open" />}
          placeholder="Please input value"
        />
      </antd.Form.Item>

      <antd.Form.Item className="text-center">
        <></>
        <PrimaryButton title="Add" htmlType="submit" />
      </antd.Form.Item>
    </antd.Form>
  );
};

export { AddConfig };
