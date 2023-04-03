import { message, Modal } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import DmTree from './DmTree';
import BcTree from './BcTree';
import './SelectTree.scss';
/**
 * 广播剧音频选择树
 * @param param0
 * @param ref
 * @returns
 */
const SelectTree = ({ onConfirmDm, onConfirmBc }: any, ref: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dmKey, setDmKey] = useState<any>('');
  const [bcKey, setBcKey] = useState<any>('');

  const dmTree = useRef<any>({});
  const bcTree = useRef<any>({});

  useImperativeHandle(ref, () => ({
    show() {
      setIsModalOpen(true);
      setTimeout(() => {
        dmTree.current?.setSelectedKeys?.([dmKey]);
        bcTree.current?.setSelectedKeys?.([bcKey]);
      }, 100);
    },
    setDmKey,
    setBcKey,
  }));

  // 选择弹幕后自动联动选择音频
  const handlerSelectDm = (node: any) => {
    bcTree.current?.setCurrentDm(node.key);
    setDmKey(node.key);
  };

  // 选择音频
  const handlerSelectBc = (node: any) => {
    setBcKey(node.key);
  };

  const handleOk = () => {
    if (!bcKey) {
      message.error('请选择音频加载');
      return;
    }
    if (!dmKey) {
      message.error('请选择弹幕加载');
      return;
    }
    onConfirmDm({ key: dmKey });
    onConfirmBc({ key: bcKey });
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title='请选择音频和弹幕加载'
      okText='确认'
      cancelText='取消'
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      className='select-tree'
      width='1000px'
      forceRender
    >
      <DmTree ref={dmTree} onSelect={handlerSelectDm} />
      <BcTree ref={bcTree} onSelect={handlerSelectBc} />
    </Modal>
  );
};

export default forwardRef(SelectTree);
