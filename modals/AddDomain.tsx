import React from 'react';
import ReactDOM from 'react-dom';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';

import { PrimaryButton } from '../components/PrimaryButton';
import { AppContext } from '../AppContext';
import { Notification } from '../components/Notification';

const AddDomain = ({
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

    const data = await appCtx.fetch('post', `/api/domain/${appName}`, [
      values.domain,
    ]);

    if (data) {
      Notification.add('success', 'Success Add');
      onSuccess();
    }
  };

  return (
    <antd.Form onFinish={onFinish}>
      <h5 className="font-weight-bold mb-4">Add Domain</h5>

      <antd.Form.Item
        name="domain"
        rules={[{ required: true, message: 'Input domain' }]}
      >
        <antd.Input
          prefix={<i className="fa fa-user" />}
          placeholder="Please input domain"
        />
      </antd.Form.Item>

      <antd.Form.Item className="text-center">
        <PrimaryButton title="Add" htmlType="submit" />
      </antd.Form.Item>
    </antd.Form>
  );
};

export { AddDomain };
