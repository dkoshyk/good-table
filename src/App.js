import './App.css';
import Papa from 'papaparse';
import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);

  const [multipleSelect, setMultipleSelect] = useState(true);
  const [selectionStarted, setSelectionStarted] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);

  const papaParse = (file) => {
    Papa.parse(file, {
      complete: function (results) {
        console.log("Parsed: ", results);
        let goodArrays = reMap(results.data);
        console.log("GoodArray: ", goodArrays);
        setCsvData(goodArrays);
      }
    });
  }

  const reMap = (arrays) => {
    let arrayResult = [];

    arrays.forEach((row, yIndex) => {
      let mappedRow = row.map((cell, xIndex) => {
        return { xIndex: xIndex, yIndex: yIndex, value: cell, selected: false }
      })

      arrayResult.push(mappedRow);
    })

    return arrayResult;
  }

  const handleFileSelected = (e) => {
    const files = Array.from(e.target.files);
    setFile(files[0]);
    console.log("files:", files);
  }

  const onHandleSelect = (cell) => {
    cell.selected = !cell.selected;
    console.log('click: ', cell);
    setCsvData([...csvData]);
  }

  const onHandleTouchMove = (cell) => {
    setEndCell(cell);
  }

  const onHandleStart = (cell) => {
    setStartCell(cell);
    setSelectionStarted(true);
    
    console.log('onHandleStart: ', cell);
  }

  const onHandleStop = (cell) => {
    csvData.forEach((row) => {
      row.forEach((cell) => {
        let beeingSelected = isCellBeingSelected(cell);
        if (cell.selected || beeingSelected) {
          cell.selected = true;
        } else {
          cell.selected = false;
        }
      })
    })

    setCsvData([...csvData]);
    setSelectionStarted(false);

    console.log('onHandleStop: ', cell);
  }

  const isCellBeingSelected = (cell) => {
    if (cell === null || startCell === null || endCell === null) return false;

    const minYIndex = Math.min(startCell.yIndex, endCell.yIndex);
    const maxYIndex = Math.max(startCell.yIndex, endCell.yIndex);
    const minXIndex = Math.min(startCell.xIndex, endCell.xIndex);
    const maxXIndex = Math.max(startCell.xIndex, endCell.xIndex);

    return (selectionStarted && (cell.yIndex >= minYIndex &&
      cell.yIndex <= maxYIndex &&
      cell.xIndex >= minXIndex &&
      cell.xIndex <= maxXIndex)
    );
  };

  return (
    <div className="App">
      <div className="file-block">
        <input type="file" onChange={handleFileSelected} />
        <button onClick={() => { papaParse(file) }}>Parse</button>
      </div>
      <div className="table-block">
        {
          csvData != null
            ?
            <div className="table-wrapper">
              {csvData.map((currElement, index) => {
                return (
                  <div className="table-row" key={index}>
                    {
                      currElement.map((item, index) => {
                        return (
                          <div key={index}
                            className={item.selected || isCellBeingSelected(item) ? 'table-cell-selected' : 'table-cell'}
                            //onClick={() => { onHandleSelect(item); }}
                            onMouseMove = {() => { onHandleTouchMove(item) }}
                            onMouseDown = {() => { onHandleStart(item) }}
                            onMouseUp = {() => { onHandleStop(item) }}
                          >
                            {item.value}
                          </div>
                        );
                      })
                    }
                  </div>
                );
              })}
            </div>
            : <span></span>
        }
      </div>
    </div>
  );
}

export default App;
