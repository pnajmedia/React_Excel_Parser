import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { parse } from "papaparse";
import './index.css';
import Axios from "axios";
import userEvent from "@testing-library/user-event";
import Alert from './Alerts'


function App() {
  //Created destructured array; Preferred functional comp over className comp.
  const [items, setItems] = useState([]);
  const [highlighted, setHighlighted] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgStatus, setMsgStatus] = useState('');

  const readUploadedExcel = (file) => {
    console.log('File info', file)
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      //Evaluation/Conversion phase
      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        resolve(data);
      };

      //Error case scenario
      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    //Success case scenario
    promise.then((rowDat) => {
      setItems(rowDat);
    });
  };

  //Clear all the content
  const clear = () => {
    setItems([]);
    setMsg('');
    setMsgStatus('');

  }

  // Fucntion for making axios call and pass all header/data for api end point
  const process = (items) => {
    const options = {
      method: 'post',
      url: '/dummyApi',
      data: items,
      transformRequest: [(data, headers) => {
        // transform the data
        return data;
      }]
    };
    Axios.post(options).
      then(res => {
        //setItems(res.data) To update the returned response.
        setMsg('File Processed Succefully!');
        setMsgStatus('success')
      }
        , (error) => { setMsg('File Processing Failed! Please ensure File is uploaded or check your Network'); setMsgStatus('danger') });
  }

  //Clears all alerts after 20 seconds 
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgStatus('');
      setMsg('');
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wrapper-container" id="bonBg">
      <div className="box">
        <div className="jumbotron jumbotron-fluid">
          <div className="container">
            <h1 className="display-4">AZ - Excel Uploader</h1>
            <p className="lead">This utility lets you upload Excel/csv files and render Data on UI.</p>
          </div>
        </div>
        {/* Drag drop logic */}
        <div
          className={`p-6 my-2 mx-auto max-w-md border-2 ${highlighted ? "hoverOn" : "hoverOff"
            }`}
          onDragEnter={() => {
            setHighlighted(true);
          }}
          onDragLeave={() => {
            setHighlighted(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            setHighlighted(false);
            console.log('PJ droppepd file info', e.dataTransfer.files[0].type);

            if (e.dataTransfer.files[0].type === "text/csv") {
              Array.from(e.dataTransfer.files)
                  .forEach(async (file) => {
                    const text = await file.text();
                    const result = parse(text, { header: true });
                    setItems((existing) => [...existing, ...result.data]);
                  });
            } else if (e.dataTransfer.files[0].type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
              readUploadedExcel(e.dataTransfer.files[0]);
            } else {
              setMsg('Please upload a valid Excel/CSV format file');
              setMsgStatus('danger');
            }
          }}
        >
          <i className="glyphicon glyphicon-cloud-upload"></i> &nbsp;
          DROP YOUR EXCEL HERE
       </div>


        {/* {msg ? <div className={`alert alert-${msgStatus}`}> {msg}</div> : ''} */}
        {/* Dedicated component for creating Alerts  */}
        <Alert msg={msg} msgStatus={msgStatus} />
        <br />
        {/* Rendering Table */}
        {items && items.length > 0 ?
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th scope="col">TERRITORY ID</th>
                <th scope="col">TERRITORY NAME</th>
                <th scope="col">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => {
                console.log('Table_Data', d)
                return (
                  <tr key={d.TerritoryName}>
                    <td>{d.TerritoryId}</td>
                    <td>{d.TerritoryName}</td>
                    <td>{d.Status}</td>
                  </tr>)
              })}
            </tbody>
          </table> : ''
        }
        {/* Decision Makers */}
        <button className="btn btn-sm btn-danger pull-left" name="cancel" onClick={(e) => { clear(e) }}>CLEAR</button>
        <button className="btn btn-sm btn-success pull-right" name="process" onClick={(e) => { process(items) }}>PROCESS</button>
      </div>
    </div>
  );
}

export default App;
