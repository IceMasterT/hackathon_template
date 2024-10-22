let sheets = [createEmptySheet()];
let currentSheet = 0;
let selectedCell = null;
let clipboard = null;

function createEmptySheet() {
  return {
      data: Array(100).fill().map(() => Array(26).fill('')),
      styles: {},
      mergedCells: [],
      columnWidths: {},
      rowHeights: {},
      hiddenColumns: [],
      hiddenRows: [],
      filters: {},
      validations: {},
      comments: {}
  };
}

function initializeSpreadsheet() {
    renderSheet();
    renderSheetTabs();
    setupEventListeners();
}

function renderSheet() {
  const spreadsheet = document.getElementById('spreadsheet');
  spreadsheet.innerHTML = '';
  const table = document.createElement('table');
  
  // Create header row
  const headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th')); // Empty corner cell
  for (let i = 0; i < 26; i++) {
      const th = document.createElement('th');
      th.textContent = String.fromCharCode(65 + i);
      headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Create data rows
  for (let row = 0; row < 100; row++) {
      const tr = document.createElement('tr');
      const rowHeader = document.createElement('th');
      rowHeader.textContent = row + 1;
      tr.appendChild(rowHeader);

      for (let col = 0; col < 26; col++) {
          const td = document.createElement('td');
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'cell';
          input.dataset.row = row;
          input.dataset.col = col;
          input.value = sheets[currentSheet].data[row][col] || ''; // Use empty string if undefined
          applyStyleToCell(input, row, col);
          td.appendChild(input);
          tr.appendChild(td);
      }
      table.appendChild(tr);
  }

  spreadsheet.appendChild(table);
}

function renderSheetTabs() {
    const tabsContainer = document.getElementById('sheet-tabs');
    tabsContainer.innerHTML = '';
    sheets.forEach((sheet, index) => {
        const tab = document.createElement('div');
        tab.className = 'sheet-tab';
        tab.textContent = `Sheet ${index + 1}`;
        if (index === currentSheet) {
            tab.classList.add('active');
        }
        tab.addEventListener('click', () => switchSheet(index));
        tabsContainer.appendChild(tab);
    });
}

function setupEventListeners() {
    document.getElementById('spreadsheet').addEventListener('input', handleCellInput);
    document.getElementById('spreadsheet').addEventListener('focus', handleCellFocus, true);
    document.getElementById('new-sheet-btn').addEventListener('click', addNewSheet);
    document.getElementById('delete-sheet-btn').addEventListener('click', deleteCurrentSheet);
    document.getElementById('cell-input').addEventListener('input', updateSelectedCell);
    document.getElementById('function-select').addEventListener('change', insertFunction);

    // Menu event listeners
    document.getElementById('new-sheet').addEventListener('click', addNewSheet);
    document.getElementById('open-recent').addEventListener('click', openRecent);
    document.getElementById('open-local').addEventListener('click', openLocal);
    document.getElementById('open-database').addEventListener('click', openDatabase);
    document.getElementById('open-url').addEventListener('click', openURL);
    document.getElementById('save-local').addEventListener('click', saveLocal);
    document.getElementById('save-as-csv').addEventListener('click', saveAsCSV);
    document.getElementById('print-spreadsheet').addEventListener('click', printSpreadsheet);
    document.getElementById('close-current-tab').addEventListener('click', closeCurrentSheet);
    document.getElementById('logout').addEventListener('click', logout);
    document.getElementById('exit-application').addEventListener('click', exitApplication);
    
    document.getElementById('cut').addEventListener('click', cutSelectedCells);
    document.getElementById('copy').addEventListener('click', copySelectedCells);
    document.getElementById('paste').addEventListener('click', pasteToSelectedCell);
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    
    document.getElementById('zoom-in').addEventListener('click', zoomIn);
    document.getElementById('zoom-out').addEventListener('click', zoomOut);
    document.getElementById('toggle-formula-bar').addEventListener('click', toggleFormulaBar);
    document.getElementById('toggle-gridlines').addEventListener('click', toggleGridlines);
    
    document.getElementById('insert-row').addEventListener('click', insertRow);
    document.getElementById('insert-column').addEventListener('click', insertColumn);
    document.getElementById('insert-chart').addEventListener('click', showChartModal);
    
    document.getElementById('format-bold').addEventListener('click', () => formatText('bold'));
    document.getElementById('format-italic').addEventListener('click', () => formatText('italic'));
    document.getElementById('format-underline').addEventListener('click', () => formatText('underline'));
    document.getElementById('format-cell').addEventListener('click', showFormatCellModal);
    
    document.getElementById('sort-ascending').addEventListener('click', () => sortColumn('asc'));
    document.getElementById('sort-descending').addEventListener('click', () => sortColumn('desc'));
    document.getElementById('filter-data').addEventListener('click', filterData);

    // Context menu event listeners
    document.addEventListener('contextmenu', showContextMenu);
    document.addEventListener('click', hideContextMenu);
    document.getElementById('context-cut').addEventListener('click', cutSelectedCells);
    document.getElementById('context-copy').addEventListener('click', copySelectedCells);
    document.getElementById('context-paste').addEventListener('click', pasteToSelectedCell);
    document.getElementById('context-insert-row').addEventListener('click', insertRow);
    document.getElementById('context-insert-column').addEventListener('click', insertColumn);
    document.getElementById('context-delete-row').addEventListener('click', deleteRow);
    document.getElementById('context-delete-column').addEventListener('click', deleteColumn);

    // Modal event listeners
    document.getElementById('create-chart-btn').addEventListener('click', createChart);
    document.getElementById('close-chart-modal').addEventListener('click', closeChartModal);
    document.getElementById('apply-format').addEventListener('click', applyFormatting);
    document.getElementById('close-format-modal').addEventListener('click', closeFormatCellModal);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleCellInput(event) {
  if (event.target.classList.contains('cell')) {
      const row = parseInt(event.target.dataset.row);
      const col = parseInt(event.target.dataset.col);
      sheets[currentSheet].data[row][col] = event.target.value || ''; // Store empty string if value is falsy
      updateCellInput(event.target.value);
  }
}

function handleCellFocus(event) {
    if (event.target.classList.contains('cell')) {
        selectedCell = event.target;
        updateCellInput(event.target.value);
        updateSelectedCellDisplay(event.target.dataset.row, event.target.dataset.col);
    }
}

function updateCellInput(value) {
    document.getElementById('cell-input').value = value;
}

function updateSelectedCell() {
  if (selectedCell) {
      const row = parseInt(selectedCell.dataset.row);
      const col = parseInt(selectedCell.dataset.col);
      const value = document.getElementById('cell-input').value || ''; // Use empty string if value is falsy
      selectedCell.value = value;
      sheets[currentSheet].data[row][col] = value;
  }
}

function updateSelectedCellDisplay(row, col) {
    const cellAddress = `${String.fromCharCode(65 + parseInt(col))}${parseInt(row) + 1}`;
    document.getElementById('selected-cell').textContent = `Selected: ${cellAddress}`;
}

function addNewSheet() {
    sheets.push(createEmptySheet());
    currentSheet = sheets.length - 1;
    renderSheetTabs();
    renderSheet();
}

function deleteCurrentSheet() {
    if (sheets.length > 1) {
        sheets.splice(currentSheet, 1);
        currentSheet = Math.max(0, currentSheet - 1);
        renderSheetTabs();
        renderSheet();
    } else {
        alert('Cannot delete the last sheet.');
    }
}

function switchSheet(index) {
    currentSheet = index;
    renderSheetTabs();
    renderSheet();
}

function insertFunction() {
    const functionName = document.getElementById('function-select').value;
    if (functionName && selectedCell) {
        const currentValue = selectedCell.value;
        selectedCell.value = `=${functionName}(${currentValue})`;
        updateCellInput(selectedCell.value);
        sheets[currentSheet].data[selectedCell.dataset.row][selectedCell.dataset.col] = selectedCell.value;
    }
}

function openRecent() {
    alert('Open Recent functionality not implemented in this demo.');
}

function openLocal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json,.xlsx';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            const content = event.target.result;
            if (file.name.endsWith('.csv')) {
                importCSV(content);
            } else if (file.name.endsWith('.json')) {
                importJSON(content);
            } else if (file.name.endsWith('.xlsx')) {
                importXLSX(content);
            }
        };
        reader.readAsBinaryString(file);
    };
    input.click();
}

function openDatabase() {
    alert('Database connection functionality not implemented in this demo.');
}

function openURL() {
    const url = prompt('Enter the URL of the CSV, JSON, or XLSX file:');
    if (url) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = event => {
                    const content = event.target.result;
                    if (url.endsWith('.csv')) {
                        importCSV(content);
                    } else if (url.endsWith('.json')) {
                        importJSON(content);
                    } else if (url.endsWith('.xlsx')) {
                        importXLSX(content);
                    } else {
                        throw new Error('Unsupported file type');
                    }
                };
                reader.readAsBinaryString(blob);
            })
            .catch(error => {
                alert('Error fetching file: ' + error.message);
            });
    }
}

function importCSV(content) {
    const rows = content.split('\n').map(row => row.split(','));
    sheets[currentSheet].data = rows;
    renderSheet();
}

function importJSON(content) {
    try {
        const data = JSON.parse(content);
        if (Array.isArray(data) && data.every(row => Array.isArray(row))) {
            sheets[currentSheet].data = data;
        } else {
            throw new Error('Invalid JSON format');
        }
        renderSheet();
    } catch (error) {
        alert('Error parsing JSON: ' + error.message);
    }
}

function importXLSX(content) {
    try {
        const workbook = XLSX.read(content, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        sheets[currentSheet].data = data;
        renderSheet();
    } catch (error) {
        alert('Error parsing XLSX: ' + error.message);
    }
}

function saveLocal() {
    const data = JSON.stringify(sheets);
    localStorage.setItem('spreadsheetData', data);
    alert('Spreadsheet saved locally.');
}

function saveAsCSV() {
    const csv = sheets[currentSheet].data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'spreadsheet.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function printSpreadsheet() {
    window.print();
}

function closeCurrentSheet() {
    if (sheets.length > 1) {
        sheets.splice(currentSheet, 1);
        currentSheet = Math.max(0, currentSheet - 1);
        renderSheetTabs();
        renderSheet();
    } else {
        alert('Cannot close the last sheet.');
    }
}

function logout() {
    alert('Logout functionality not implemented in this demo.');
}

function exitApplication() {
    if (confirm('Are you sure you want to exit? Any unsaved changes will be lost.')) {
        window.close();
    }
}

function cutSelectedCells() {
    copySelectedCells();
    clearSelectedCells();
}

function copySelectedCells() {
    if (selectedCell) {
        clipboard = {
            value: selectedCell.value,
            style: selectedCell.style.cssText
        };
    }
}

function pasteToSelectedCell() {
    if (selectedCell && clipboard) {
        selectedCell.value = clipboard.value;
        selectedCell.style.cssText = clipboard.style;
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        sheets[currentSheet].data[row][col] = clipboard.value;
        sheets[currentSheet].styles[`${row},${col}`] = clipboard.style;
    }
}

function clearSelectedCells() {
    if (selectedCell) {
        selectedCell.value = '';
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        sheets[currentSheet].data[row][col] = '';
    }
}

let undoStack = [];
let redoStack = [];

function saveState() {
    undoStack.push(JSON.parse(JSON.stringify(sheets)));
    redoStack = [];
}

function undo() {
    if (undoStack.length > 0) {
        redoStack.push(JSON.parse(JSON.stringify(sheets)));
        sheets = undoStack.pop();
        renderSheet();
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(JSON.parse(JSON.stringify(sheets)));
        sheets = redoStack.pop();
        renderSheet();
    }
}

function zoomIn() {
    const spreadsheet = document.getElementById('spreadsheet');
    const currentScale = getComputedStyle(spreadsheet).getPropertyValue('--scale') || 1;
    spreadsheet.style.setProperty('--scale', parseFloat(currentScale) + 0.1);
}

function zoomOut() {
    const spreadsheet = document.getElementById('spreadsheet');
    const currentScale = getComputedStyle(spreadsheet).getPropertyValue('--scale') || 1;
    spreadsheet.style.setProperty('--scale', Math.max(0.1, parseFloat(currentScale) - 0.1));
}

function toggleFormulaBar() {
    const formulaBar = document.getElementById('cell-input');
    formulaBar.style.display = formulaBar.style.display === 'none' ? 'block' : 'none';
}

function toggleGridlines() {
    const spreadsheet = document.getElementById('spreadsheet');
    spreadsheet.classList.toggle('no-gridlines');
}

function insertRow() {
  const newRow = Array(26).fill('');
  sheets[currentSheet].data.splice(parseInt(selectedCell.dataset.row), 0, newRow);
  renderSheet();
}

function insertColumn() {
  sheets[currentSheet].data.forEach(row => row.splice(parseInt(selectedCell.dataset.col), 0, ''));
  renderSheet();
}

function deleteRow() {
  sheets[currentSheet].data.splice(parseInt(selectedCell.dataset.row), 1);
  renderSheet();
}

function deleteColumn() {
  sheets[currentSheet].data.forEach(row => row.splice(parseInt(selectedCell.dataset.col), 1));
  renderSheet();
}

function showChartModal() {
  document.getElementById('chart-modal').style.display = 'block';
}

function closeChartModal() {
  document.getElementById('chart-modal').style.display = 'none';
}

function createChart() {
  const chartType = document.getElementById('chart-type').value;
  const chartData = getChartData();
  
  if (chartData.labels.length === 0 || chartData.datasets.length === 0) {
      alert('Please select a valid range of data for the chart.');
      return;
  }

  const chartContainer = document.createElement('div');
  chartContainer.style.width = '80%';
  chartContainer.style.height = '400px';
  chartContainer.style.margin = '20px auto';

  const canvas = document.createElement('canvas');
  chartContainer.appendChild(canvas);

  document.body.appendChild(chartContainer);

  new Chart(canvas, {
      type: chartType,
      data: chartData,
      options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });

  closeChartModal();
}

function getChartData() {
  const selectedRange = getSelectedRange();
  if (!selectedRange) return { labels: [], datasets: [] };

  const { startRow, endRow, startCol, endCol } = selectedRange;
  const labels = sheets[currentSheet].data[startRow].slice(startCol, endCol + 1);
  const datasets = [];

  for (let row = startRow + 1; row <= endRow; row++) {
      const datasetData = sheets[currentSheet].data[row].slice(startCol, endCol + 1).map(Number);
      datasets.push({
          label: `Dataset ${row - startRow}`,
          data: datasetData,
          backgroundColor: getRandomColor(),
          borderColor: getRandomColor(),
          borderWidth: 1
      });
  }

  return { labels, datasets };
}

function getSelectedRange() {
  // This is a simplified version. In a real application, you'd implement a way for users to select a range.
  // For this example, we'll just use a fixed range.
  return {
      startRow: 0,
      endRow: 5,
      startCol: 0,
      endCol: 5
  };
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, 0.5)`;
}

function formatText(style) {
  if (selectedCell) {
      switch (style) {
          case 'bold':
              selectedCell.style.fontWeight = selectedCell.style.fontWeight === 'bold' ? 'normal' : 'bold';
              break;
          case 'italic':
              selectedCell.style.fontStyle = selectedCell.style.fontStyle === 'italic' ? 'normal' : 'italic';
              break;
          case 'underline':
              selectedCell.style.textDecoration = selectedCell.style.textDecoration === 'underline' ? 'none' : 'underline';
              break;
      }
      const row = parseInt(selectedCell.dataset.row);
      const col = parseInt(selectedCell.dataset.col);
      sheets[currentSheet].styles[`${row},${col}`] = selectedCell.style.cssText;
  }
}

function showFormatCellModal() {
  document.getElementById('format-cell-modal').style.display = 'block';
}

function closeFormatCellModal() {
  document.getElementById('format-cell-modal').style.display = 'none';
}

function applyFormatting() {
  if (selectedCell) {
      const fontFamily = document.getElementById('font-family').value;
      const fontSize = document.getElementById('font-size').value;
      const fontColor = document.getElementById('font-color').value;
      const backgroundColor = document.getElementById('background-color').value;

      selectedCell.style.fontFamily = fontFamily;
      selectedCell.style.fontSize = `${fontSize}px`;
      selectedCell.style.color = fontColor;
      selectedCell.style.backgroundColor = backgroundColor;

      const row = parseInt(selectedCell.dataset.row);
      const col = parseInt(selectedCell.dataset.col);
      sheets[currentSheet].styles[`${row},${col}`] = selectedCell.style.cssText;
  }
  closeFormatCellModal();
}

function sortColumn(direction) {
  if (selectedCell) {
      const col = parseInt(selectedCell.dataset.col);
      sheets[currentSheet].data.sort((a, b) => {
          if (direction === 'asc') {
              return a[col].localeCompare(b[col]);
          } else {
              return b[col].localeCompare(a[col]);
          }
      });
      renderSheet();
  }
}

function filterData() {
  if (selectedCell) {
      const col = parseInt(selectedCell.dataset.col);
      const filterValue = prompt('Enter filter value:');
      if (filterValue !== null) {
          sheets[currentSheet].filters[col] = filterValue.toLowerCase();
          applyFilters();
      }
  }
}

function applyFilters() {
  const filters = sheets[currentSheet].filters;
  const rows = document.querySelectorAll('#spreadsheet tr:not(:first-child)');
  rows.forEach(row => {
      let showRow = true;
      for (let col in filters) {
          const cell = row.cells[parseInt(col) + 1].querySelector('input');
          if (cell.value.toLowerCase().indexOf(filters[col]) === -1) {
              showRow = false;
              break;
          }
      }
      row.style.display = showRow ? '' : 'none';
  });
}

function showContextMenu(event) {
  if (event.target.classList.contains('cell')) {
      event.preventDefault();
      const contextMenu = document.getElementById('context-menu');
      contextMenu.style.display = 'block';
      contextMenu.style.left = `${event.pageX}px`;
      contextMenu.style.top = `${event.pageY}px`;
  }
}

function hideContextMenu() {
  document.getElementById('context-menu').style.display = 'none';
}

function handleKeyboardShortcuts(event) {
  if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
          case 'c':
              event.preventDefault();
              copySelectedCells();
              break;
          case 'x':
              event.preventDefault();
              cutSelectedCells();
              break;
          case 'v':
              event.preventDefault();
              pasteToSelectedCell();
              break;
          case 'z':
              event.preventDefault();
              undo();
              break;
          case 'y':
              event.preventDefault();
              redo();
              break;
          case 'b':
              event.preventDefault();
              formatText('bold');
              break;
          case 'i':
              event.preventDefault();
              formatText('italic');
              break;
          case 'u':
              event.preventDefault();
              formatText('underline');
              break;
      }
  }
}

function applyStyleToCell(cell, row, col) {
  const style = sheets[currentSheet].styles[`${row},${col}`];
  if (style) {
      cell.style.cssText = style;
  }
}

// Custom formula functions
const formulaFunctions = {
  SUM: (args) => args.reduce((sum, val) => sum + parseFloat(val) || 0, 0),
  AVERAGE: (args) => args.reduce((sum, val) => sum + parseFloat(val) || 0, 0) / args.length,
  COUNT: (args) => args.filter(val => val !== '').length,
  MAX: (args) => Math.max(...args.map(val => parseFloat(val) || -Infinity)),
  MIN: (args) => Math.min(...args.map(val => parseFloat(val) || Infinity))
};

function evaluateFormula(formula) {
  const cellRegex = /([A-Z]+[0-9]+)/g;
  const functionRegex = /([A-Z]+)\((.*?)\)/g;

  // Replace cell references with their values
  formula = formula.replace(cellRegex, (match) => {
      const value = getCellValue(match);
      return isNaN(value) ? '0' : value;
  });

  // Evaluate functions
  formula = formula.replace(functionRegex, (match, funcName, args) => {
      const argArray = args.split(',').map(arg => arg.trim());
      if (formulaFunctions[funcName]) {
          return formulaFunctions[funcName](argArray);
      }
      return match; // Return original if function not found
  });

  try {
      return eval(formula);
  } catch (error) {
      console.error('Formula evaluation error:', error);
      return '#ERROR!';
  }
}

function getCellValue(cellRef) {
  const col = cellRef.match(/[A-Z]+/)[0];
  const row = parseInt(cellRef.match(/[0-9]+/)[0]) - 1;
  const colIndex = col.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
  return sheets[currentSheet].data[row][colIndex] || '';
}

function updateFormulas() {
  sheets[currentSheet].data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
          if (typeof cell === 'string' && cell.startsWith('=')) {
              const result = evaluateFormula(cell.slice(1));
              const cellElement = document.querySelector(`#spreadsheet td:nth-child(${colIndex + 2}) input[data-row="${rowIndex}"]`);
              if (cellElement) {
                  cellElement.value = result;
              }
          }
      });
  });
}

// Initialize the spreadsheet
initializeSpreadsheet();
