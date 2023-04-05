import { Tree, Tag, Button, Input } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../config';
import { CustomerServiceTwoTone, InteractionTwoTone } from '@ant-design/icons';
import { replaceCnNums } from '../utils/compare';

/**
 * 广播剧音频选择树
 * @param param0
 * @param ref
 * @returns
 */
const AudioTree = ({ onSelect }: any, ref: any) => {
  const [treeData, setTreeData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const treeRef = useRef<any>(null);
  const [searchValue, setSearchValue] = useState('');

  const [selected, setSelected] = useState<any>(null);

  const filteredData = useMemo(() => {
    return treeData.filter((item: any) => item.title.includes(searchValue));
  }, [treeData, searchValue]);

  const handlerSelectedKeys = ([key]: string[]) => {
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
  };

  useImperativeHandle(ref, () => ({
    setSelectedKeys: handlerSelectedKeys,

    getSelected() {
      return selected;
    },
    // 选择弹幕后尝试找到对应的音频
    setCurrentDm(key: string) {
      const [name, episode] = key.split('/').filter(Boolean);
      // 获取
      const [title, season] = name.split(' ').filter(Boolean);
      let bcKey = '';
      let done = false;
      treeData.forEach((item: any) => {
        if (item.title.includes(title) || title.includes(item.title)) {
          // 找到对应的季
          if (season) {
            const reg = /第([一二三四五六七八九十]+)[季期集]/;
            const seasonNum = season.match(reg);
            if (seasonNum?.length === 2) {
              const num = replaceCnNums(seasonNum[1]);
              // 从季里面找
              (item.children || []).forEach((subItem: any) => {
                if (subItem.title.includes(num)) {
                  // 从子里面找
                  (subItem.children || []).forEach((audioItem: any) => {
                    const audioNum = episode.match(reg);
                    if (audioNum?.length === 2) {
                      const aNum = replaceCnNums(audioNum[1]) + '';
                      if (audioItem.title.includes(aNum) || aNum.includes(audioItem.title)) {
                        if (!done) {
                          bcKey = audioItem.key;
                          done = true;
                        }
                      }
                    }
                  });
                }
              });
            }
          }
        }
      });
      if (bcKey) {
        handlerSelectedKeys([bcKey]);
        onSelect({ key: bcKey });
        setTimeout(() => {
          treeRef.current?.scrollTo({
            key: bcKey,
          });
        }, 500);
      }
    },
  }));

  const getTreeData = async (refresh?: string) => {
    setTreeData([]);
    const { data } = await axios.get(`${baseUrl}/audio/list`, {
      params: {
        refresh,
      },
    });
    setTreeData(data.data);
  };

  useEffect(() => {
    getTreeData();
  }, []);

  return (
    <div className='audio-tree'>
      <div className='tree-header'>
        <Tag color='red' icon={<CustomerServiceTwoTone />}>
          音频
        </Tag>
        <Input
          value={searchValue}
          onChange={(v) => {
            setSearchValue(v.target.value);
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
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
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
        }}
      />
    </div>
  );
};

export default forwardRef(AudioTree);
