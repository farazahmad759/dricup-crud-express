import React, { useState, useEffect, useReducer } from "react";
import { Table } from "antd";
import { Input, Button, Space, Popconfirm } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Link, useHistory } from "react-router-dom";
import { urlReducer } from "../../reducers/reducers";
// import Highlighter from "react-highlight-words";

export const AdminTable = (props) => {
  const [urlState, dispatchUrl] = useReducer(urlReducer, {});
  const history = useHistory();
  const [columns, setColumns] = useState(null);
  const [state, setState] = useState({
    searchText: "",
    searchedColumn: "",
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
    history.push("?" + dataIndex + "=" + selectedKeys[0].toLowerCase());
    props.actions.dispatchUrl({ type: "getSearchParams" });
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setState({ searchText: "" });
  };
  function getColumnSearchProps(dataIndex) {
    let searchInput = "";
    return {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={(node) => {
              searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) => {
        return record;
        // return record[dataIndex]
        //   ? record[dataIndex]
        //       .toString()
        //       .toLowerCase()
        //       .includes(value.toLowerCase())
        //   : "";
      },
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.select(), 100);
        }
      },
      render: (text) =>
        state.searchedColumn === dataIndex
          ? // <Highlighter
            //   highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            //   searchWords={[state.searchText]}
            //   autoEscape
            //   textToHighlight={text ? text.toString() : ""}
            // />
            text
          : text,
    };
  }
  useEffect(() => {
    async function fetchData() {
      let _cols = [];
      Object.keys(props.data[0]).forEach((k) => {
        if (k !== "key") {
          let _col = {
            title: k,
            dataIndex: k,
            key: k,
            width: "30%",
            ...getColumnSearchProps(k),
          };
          _cols.push(_col);
        }
      });
      _cols.push({
        title: "actions",
        key: "action",
        render: (text, record) => (
          <Space size="middle">
            <Link to={"/dashboard/tasks/" + record.key + "/edit"}>Edit</Link>
            <Popconfirm
              title="Are you sure delete this task?"
              onConfirm={async () => {
                await props.actions.deleteOne({
                  id: record.key,
                  msg: "Task deleted successfully",
                });
                props.actions.fetchData();
              }}
              onCancel={() => {}}
              okText="Yes"
              cancelText="No"
            >
              <div style={{ color: "#1890ff", cursor: "pointer" }}>Delete</div>
            </Popconfirm>
          </Space>
        ),
      });
      console.log(props.data);
      setColumns(_cols);
    }
    if (props.data && !columns) {
      console.log(props.data);
      fetchData();
    }
  });
  return (
    <div>
      <Table columns={columns} dataSource={props.data} />
    </div>
  );
};
