import { Tree, Tag, Button, Input, message } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../config';
import { InteractionTwoTone, RocketTwoTone } from '@ant-design/icons';

/**
 * 弹幕选择器
 * @param {*} { onSelect }
 * @param {*} ref
 * @return {*}
 */
const DanmukuTree = ({ onSelect, onSearchChange }: any, ref: any) => {
  const [treeData, setTreeData] = useState([]);
  const [selected, setSelected] = useState<any>(null);
  const treeRef = useRef<any>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  useImperativeHandle(ref, () => ({
    setSelectedKeys([key]: string[]) {
      const keys = key.split('/');
      const expandedKeys = keys
        .reduce((arr: string[], curKey: string, index: number) => {
          arr.push(keys.slice(0, index + 1).join('/'));
          return arr;
        }, [])
        .filter(Boolean);
      setExpandedKeys(expandedKeys);
      setSelectedKeys([key]);

      setTimeout(() => {
        treeRef.current?.scrollTo({
          key,
        });
      }, 500);
    },
    getSelected() {
      return selected;
    },
  }));

  const getTreeData = async (refresh?: string) => {
    if (refresh) {
      message.loading('正在刷新弹幕列表', 5000);
    }
    setTreeData([]);
    const { data } = await axios.get(`${baseUrl}/danmuku/list`, {
      params: {
        refresh,
      },
    });

    setTreeData(data.data);
  };

  const filteredData = useMemo(() => {
    return treeData.filter((item: any) => item.title.includes(searchValue));
  }, [treeData, searchValue]);

  useEffect(() => {
    getTreeData();
  }, []);

  return (
    <div className='danmuku-tree'>
      <div className='tree-header'>
        <Tag color='red' icon={<RocketTwoTone />}>
          弹幕
        </Tag>
        <Input
          value={searchValue}
          onChange={(v) => {
            setSearchValue(v.target.value);
            onSearchChange(v.target.value);
          }}
          style={{ marginRight: 6 }}
        />
        <Button
          title='刷新'
          shape='circle'
          icon={<InteractionTwoTone />}
          onClick={() => {
            getTreeData('1');
          }}
        ></Button>
      </div>

      <Tree
        ref={treeRef}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        height={500}
        showLine
        treeData={filteredData}
        onExpand={(keys: any) => {
          setExpandedKeys(keys);
        }}
        onSelect={(keys, info: any) => {
          const selected = info.selected ? info.node : null;
          setSelected(selected);
          if (selected && !selected.children?.length) onSelect(selected);
          setSelectedKeys([selected?.key].filter(Boolean));
        }}
      />
    </div>
  );
};

export default forwardRef(DanmukuTree);
