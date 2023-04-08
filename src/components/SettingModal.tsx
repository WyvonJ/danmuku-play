import { Button, Modal, Select, Slider, Tag } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { SettingTwoTone } from '@ant-design/icons';
import './SettingModal.scss';

const fontOptions = [
  { value: 'PingFang TC', label: '苹方' },
  { value: 'Source Han Serif TC', label: '思源宋体TC' },
  { value: 'Source Han Serif TC Medium', label: '思源宋体TC 中黑' },
  { value: 'Source Han Serif TC Bold', label: '思源宋体TC 粗' },
  { value: 'HYChangLiSongKeBenTruingW', label: '汉仪昌黎宋刻本' },
  { value: 'RuiZiYunZiKuZhunYuanTiGBK-1', label: '锐字云字库准圆体' },
  { value: 'PingXiamYaSong', label: '汉仪屏显雅宋' },
  { value: 'XiaWuWenKai', label: '霞鹜文楷' },
  { value: 'FZBWKSK--GBK1-0', label: '方正北魏楷书' },
  { value: 'RuiZiYunZiKuLiBianTiGBK-1', label: '锐字云字库隶变体' },
];

/**
 * 设置
 * @param param0
 * @param ref
 * @returns
 */
const SettingModal = (_: any, ref: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [styles, setStyles] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [fontSize, setFontSize] = useState(20);

  useImperativeHandle(ref, () => ({
    show() {
      setIsModalOpen(true);
    },
  }));

  const handleOk = () => {
    setStyles(`
    #root .app .cmt {
      font-family: "${fontFamily || 'PingFang TC'}";
      font-size: ${fontSize || 20}px!important;
    }
    `);
    localStorage.setItem('danmuku_font_family', fontFamily);
    localStorage.setItem('danmuku_font_size', fontSize + '');
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handlerChangeFontFamily = (v: string) => {
    setFontFamily(v);
  };

  useEffect(() => {
    const fontFamily = localStorage.getItem('danmuku_font_family');
    const fontSize = localStorage.getItem('danmuku_font_size');
    if (fontFamily) {
      setFontFamily(fontFamily);
    }
    if (fontSize) {
      setFontSize(+fontSize);
    }
    if (fontFamily || fontSize) {
      setStyles(`
      #root .app .cmt {
        font-family: "${fontFamily || 'PingFang TC'}";
        font-size: ${fontSize || 20}px!important;
      }
      `);
    }
  }, []);

  return (
    <>
      <style>{styles}</style>

      <Button
        icon={<SettingTwoTone />}
        shape='circle'
        ghost
        danger
        onClick={() => {
          setIsModalOpen(true);
        }}
      ></Button>

      <Modal
        title='设置'
        okText='确认'
        cancelText='取消'
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        className='setting-modal'
        width='500px'
        forceRender
      >
        <div style={{ fontFamily, fontSize }}>测试字体</div>
        <div className='setting-item'>
          <div className='setting-item__label'>
            <Tag color='red'>字号</Tag>
          </div>
          <div className='setting-item__value'>
            <Slider onChange={setFontSize} value={fontSize} min={10} max={30} />
          </div>
        </div>
        <div className='setting-item'>
          <div className='setting-item__label'>
            <Tag color='red'>字体</Tag>
          </div>
          <div className='setting-item__value'>
            <Select value={fontFamily} style={{ width: 300 }} onChange={handlerChangeFontFamily} options={fontOptions} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default forwardRef(SettingModal);
