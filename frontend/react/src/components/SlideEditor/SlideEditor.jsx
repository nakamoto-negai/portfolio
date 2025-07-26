import React, { useState, useRef, useCallback } from 'react';
import './SlideEditor.css';

const SlideEditor = () => {
  // スライドのデータ構造
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: 'スライド 1',
      background: '#ffffff',
      elements: [
        {
          id: 'title-1',
          type: 'text',
          content: 'タイトルを入力',
          x: 50,
          y: 100,
          width: 400,
          height: 60,
          fontSize: 32,
          fontWeight: 'bold',
          color: '#000000',
          textAlign: 'left',
          zIndex: 1
        }
      ]
    }
  ]);

  // サムネイル生成用のcanvasサイズ
  const THUMBNAIL_WIDTH = 176;
  const THUMBNAIL_HEIGHT = 90;
  const SCALE_FACTOR = THUMBNAIL_WIDTH / 800;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    elementId: null
  });
  const [resizeState, setResizeState] = useState({
    isResizing: false,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    elementId: null
  });
  const [clipboard, setClipboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExporting, setIsExporting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fileInputRef = useRef(null);

  // 履歴管理 - 修正版
  const saveToHistory = useCallback((newSlides) => {
    const slidesToSave = newSlides || slides;
    
    // スライドデータの妥当性をチェック
    if (!slidesToSave || slidesToSave.length === 0) {
      console.warn('無効なスライドデータのため履歴保存をスキップ');
      return;
    }
    
    try {
      const slidesCopy = JSON.parse(JSON.stringify(slidesToSave));
      
      // コピーしたデータの妥当性も確認
      if (slidesCopy && Array.isArray(slidesCopy) && slidesCopy.length > 0) {
        setHistory(prevHistory => {
          // 現在のインデックス以降の履歴を削除（新しい分岐を作成）
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          newHistory.push(slidesCopy);
          
          // 最大50回まで保持
          const trimmedHistory = newHistory.slice(-50);
          
          console.log('履歴保存完了:', trimmedHistory.length, '件');
          return trimmedHistory;
        });
        
        setHistoryIndex(prev => {
          const newIndex = Math.min(prev + 1, 49); // 最大インデックスは49
          return newIndex;
        });
      }
    } catch (error) {
      console.error('履歴保存エラー:', error);
    }
  }, [slides, historyIndex]);

  // 初期履歴の設定
  React.useEffect(() => {
    if (!isInitialized && slides.length > 0) {
      console.log('初期履歴を設定');
      const initialSlides = JSON.parse(JSON.stringify(slides));
      setHistory([initialSlides]);
      setHistoryIndex(0);
      setIsInitialized(true);
    }
  }, [slides, isInitialized]);

  // Undo/Redo - 修正版
  const undo = () => {
    console.log('Undo実行:', historyIndex, 'history length:', history.length);
    
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const historyData = history[newIndex];
      
      console.log('Undo - 新しいインデックス:', newIndex, 'データ:', historyData);
      
      // 履歴データの妥当性をチェック
      if (historyData && Array.isArray(historyData) && historyData.length > 0) {
        setHistoryIndex(newIndex);
        setSlides(historyData);
        
        // 現在のスライドインデックスが範囲外の場合は調整
        if (currentSlideIndex >= historyData.length) {
          setCurrentSlideIndex(historyData.length - 1);
        }
        
        setSelectedElement(null); // 選択状態をクリア
        console.log('Undo完了 - スライド数:', historyData.length);
      } else {
        console.warn('無効な履歴データです:', historyData);
      }
    } else {
      console.log('これ以上戻れません');
    }
  };

  const redo = () => {
    console.log('Redo実行:', historyIndex, 'history length:', history.length);
    
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const historyData = history[newIndex];
      
      console.log('Redo - 新しいインデックス:', newIndex, 'データ:', historyData);
      
      // 履歴データの妥当性をチェック
      if (historyData && Array.isArray(historyData) && historyData.length > 0) {
        setHistoryIndex(newIndex);
        setSlides(historyData);
        
        // 現在のスライドインデックスが範囲外の場合は調整
        if (currentSlideIndex >= historyData.length) {
          setCurrentSlideIndex(historyData.length - 1);
        }
        
        setSelectedElement(null); // 選択状態をクリア
        console.log('Redo完了 - スライド数:', historyData.length);
      } else {
        console.warn('無効な履歴データです:', historyData);
      }
    } else {
      console.log('これ以上進めません');
    }
  };

  // スライド間のナビゲーション（最もシンプルな実装）
  const handleSlideClick = (index) => {
    console.log('Slide clicked:', index, 'Current:', currentSlideIndex);
    setCurrentSlideIndex(index);
    setSelectedElement(null);
  };

  // 新しいスライドを追加 - 修正版
  const addSlide = () => {
    console.log('スライド追加開始 - 現在のスライド数:', slides.length);
    
    const newSlide = {
      id: Date.now(),
      title: `スライド ${slides.length + 1}`,
      background: '#ffffff',
      elements: []
    };
    
    const updatedSlides = [...slides, newSlide];
    setSlides(updatedSlides);
    setCurrentSlideIndex(updatedSlides.length - 1);
    setSelectedElement(null);
    
    // 新しい状態を履歴に保存
    saveToHistory(updatedSlides);
    
    console.log('スライド追加完了 - 新しいスライド数:', updatedSlides.length);
  };

  // スライドを複製 - 修正版
  const duplicateSlide = (slideIndex) => {
    console.log('スライド複製開始:', slideIndex);
    
    const slideToClone = slides[slideIndex];
    const newSlide = {
      ...JSON.parse(JSON.stringify(slideToClone)),
      id: Date.now(),
      title: `${slideToClone.title} (コピー)`,
      elements: slideToClone.elements.map(el => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random()}`
      }))
    };
    
    const newSlides = [...slides];
    newSlides.splice(slideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(slideIndex + 1);
    
    // 新しい状態を履歴に保存
    saveToHistory(newSlides);
    
    console.log('スライド複製完了 - 新しいスライド数:', newSlides.length);
  };

  // スライドを削除 - 修正版
  const deleteSlide = (slideIndex) => {
    if (slides.length <= 1) return;
    
    console.log('スライド削除開始:', slideIndex);
    
    const updatedSlides = slides.filter((_, index) => index !== slideIndex);
    setSlides(updatedSlides);
    
    if (slideIndex === currentSlideIndex) {
      setCurrentSlideIndex(Math.max(0, slideIndex - 1));
    } else if (slideIndex < currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
    
    // 新しい状態を履歴に保存
    saveToHistory(updatedSlides);
    
    console.log('スライド削除完了 - 新しいスライド数:', updatedSlides.length);
  };

  // PowerPoint形式でエクスポート
  const exportToPowerPoint = async () => {
    if (isExporting) return; // 重複実行を防止
    
    setIsExporting(true);
    try {
      console.log('PowerPointエクスポート開始...');
      
      // 複数のCDNを試行する
      const cdnUrls = [
        'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.min.js',
        'https://unpkg.com/pptxgenjs@3.12.0/dist/pptxgen.bundle.min.js',
        'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.min.js'
      ];
      
      // PptxGenJSをCDNから動的にロード（フォールバック付き）
      if (!window.PptxGenJS) {
        console.log('PptxGenJSライブラリを読み込み中...');
        
        let loadSuccess = false;
        let lastError = null;
        
        for (const url of cdnUrls) {
          try {
            console.log(`CDNを試行中: ${url}`);
            await new Promise((resolve, reject) => {
              // 既存のスクリプトタグを削除
              const existingScript = document.querySelector('script[src*="pptxgen"]');
              if (existingScript) {
                existingScript.remove();
              }
              
              const script = document.createElement('script');
              script.src = url;
              script.async = true;
              script.crossOrigin = 'anonymous';
              
              const timeout = setTimeout(() => {
                script.remove();
                reject(new Error(`タイムアウト: ${url}`));
              }, 15000); // 15秒タイムアウト
              
              script.onload = () => {
                clearTimeout(timeout);
                console.log(`ライブラリ読み込み成功: ${url}`);
                resolve();
              };
              
              script.onerror = () => {
                clearTimeout(timeout);
                script.remove();
                reject(new Error(`読み込み失敗: ${url}`));
              };
              
              document.head.appendChild(script);
            });
            
            // ライブラリが正しく読み込まれたかチェック
            if (window.PptxGenJS && typeof window.PptxGenJS === 'function') {
              loadSuccess = true;
              break;
            } else {
              throw new Error('ライブラリは読み込まれましたが、PptxGenJSが利用できません');
            }
            
          } catch (error) {
            console.warn(`CDN読み込み失敗: ${url}`, error);
            lastError = error;
            continue;
          }
        }
        
        if (!loadSuccess) {
          throw new Error(`すべてのCDNからの読み込みに失敗しました。最後のエラー: ${lastError?.message}`);
        }
        
        console.log('PptxGenJSライブラリの読み込み完了');
      }

      // ライブラリの存在を再確認
      if (!window.PptxGenJS || typeof window.PptxGenJS !== 'function') {
        throw new Error('PptxGenJSライブラリが正しく読み込まれていません');
      }

      const pptx = new window.PptxGenJS();
      console.log('PowerPointインスタンス作成完了');
      
      // プレゼンテーションの設定
      pptx.layout = 'LAYOUT_16x9';
      
      // 各スライドを処理
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        console.log(`スライド ${i + 1} を処理中...`);
        
        const pptxSlide = pptx.addSlide();
        
        // 背景色を設定（16進数の#を除去）
        if (slide.background && slide.background !== '#ffffff') {
          const bgColor = slide.background.replace('#', '').toUpperCase();
          if (/^[0-9A-F]{6}$/i.test(bgColor)) {
            pptxSlide.background = { color: bgColor };
          }
        }

        // 要素をzIndex順にソート
        const sortedElements = [...slide.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        console.log(`スライド ${i + 1}: ${sortedElements.length}個の要素を処理`);

        for (let j = 0; j < sortedElements.length; j++) {
          const element = sortedElements[j];
          console.log(`要素 ${j + 1} (${element.type}) を処理中...`);
          
          try {
            // 座標をインチに変換（PowerPoint用）
            const x = Math.max(0, (element.x / 800) * 10);
            const y = Math.max(0, (element.y / 450) * 5.63);
            const w = Math.max(0.1, (element.width / 800) * 10);
            const h = Math.max(0.1, (element.height / 450) * 5.63);

            if (element.type === 'text') {
              // テキスト要素
              const textContent = element.content || 'テキスト';
              const fontSize = Math.max(8, Math.min(72, element.fontSize * 0.75));
              const fontColor = element.color ? element.color.replace('#', '').toUpperCase() : '000000';
              
              // 色の形式をチェック
              const validColor = /^[0-9A-F]{6}$/i.test(fontColor) ? fontColor : '000000';
              
              pptxSlide.addText(textContent, {
                x: x,
                y: y,
                w: w,
                h: h,
                fontSize: fontSize,
                fontFace: 'Arial',
                color: validColor,
                bold: element.fontWeight === 'bold',
                align: element.textAlign || 'left',
                valign: 'middle',
                margin: 0
              });
              
            } else if (element.type === 'image' && element.src) {
              // 画像要素
              try {
                // Base64データかどうかをチェック
                if (element.src.startsWith('data:image/')) {
                  pptxSlide.addImage({
                    data: element.src,
                    x: x,
                    y: y,
                    w: w,
                    h: h
                  });
                } else {
                  // URLの場合はプレースホルダーを追加
                  pptxSlide.addText('[画像: URL]', {
                    x: x,
                    y: y,
                    w: w,
                    h: h,
                    fontSize: 12,
                    color: '666666',
                    align: 'center',
                    valign: 'middle',
                    fill: { color: 'F0F0F0' }
                  });
                }
              } catch (imgError) {
                console.warn('画像の追加に失敗:', imgError);
                // 画像エラー時はプレースホルダーを追加
                pptxSlide.addText('[画像エラー]', {
                  x: x,
                  y: y,
                  w: w,
                  h: h,
                  fontSize: 12,
                  color: 'FF0000',
                  align: 'center',
                  valign: 'middle',
                  fill: { color: 'FFE6E6' }
                });
              }
              
            } else if (element.type === 'shape') {
              // 図形要素
              const fillColor = element.fillColor ? element.fillColor.replace('#', '').toUpperCase() : '3498DB';
              const borderColor = element.borderColor ? element.borderColor.replace('#', '').toUpperCase() : '2980B9';
              const borderWidth = Math.max(0, Math.min(10, element.borderWidth || 2));
              
              // 色の形式をチェック
              const validFillColor = /^[0-9A-F]{6}$/i.test(fillColor) ? fillColor : '3498DB';
              const validBorderColor = /^[0-9A-F]{6}$/i.test(borderColor) ? borderColor : '2980B9';
              
              const shapeProps = {
                x: x,
                y: y,
                w: w,
                h: h,
                fill: { color: validFillColor },
                line: {
                  color: validBorderColor,
                  width: borderWidth
                }
              };

              // 図形タイプに応じて追加
              try {
                switch (element.shapeType) {
                  case 'rectangle':
                    pptxSlide.addShape('rect', shapeProps);
                    break;
                  case 'circle':
                    pptxSlide.addShape('ellipse', shapeProps);
                    break;
                  case 'triangle':
                    // 三角形として追加（一部のバージョンでサポート）
                    pptxSlide.addShape('triangle', shapeProps);
                    break;
                  default:
                    pptxSlide.addShape('rect', shapeProps);
                    break;
                }
              } catch (shapeError) {
                console.warn('図形の追加に失敗、四角形で代替:', shapeError);
                // 図形追加に失敗した場合は四角形で代替
                pptxSlide.addShape('rect', shapeProps);
              }
            }
          } catch (elementError) {
            console.warn(`要素 ${j + 1} の処理中にエラー:`, elementError);
            // エラーが発生した要素はスキップして続行
            continue;
          }
        }
        
        console.log(`スライド ${i + 1} の処理完了`);
      }

      // ファイル名を生成
      const now = new Date();
      const dateStr = now.getFullYear() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + '_' +
                     String(now.getHours()).padStart(2, '0') + 
                     String(now.getMinutes()).padStart(2, '0');
      const fileName = `presentation_${dateStr}.pptx`;
      
      console.log('PowerPointファイルを生成中...');
      
      // PowerPointファイルを保存
      await pptx.writeFile({ fileName: fileName });
      
      console.log('PowerPointファイルのエクスポートが完了しました:', fileName);
      alert(`PowerPointファイル「${fileName}」のダウンロードが開始されました。`);
      
    } catch (error) {
      console.error('PowerPointエクスポートエラー:', error);
      
      let errorMessage = 'PowerPointファイルの生成中にエラーが発生しました。\n\n';
      
      if (error.message.includes('CDN') || error.message.includes('読み込み')) {
        errorMessage += '原因: ライブラリの読み込みに失敗しました。\n';
        errorMessage += '対処法:\n';
        errorMessage += '1. インターネット接続を確認してください\n';
        errorMessage += '2. ブラウザの広告ブロッカーを無効にしてください\n';
        errorMessage += '3. 別のブラウザで試してください\n';
        errorMessage += '4. しばらく時間を置いてから再試行してください';
      } else if (error.message.includes('タイムアウト')) {
        errorMessage += '原因: ライブラリの読み込みがタイムアウトしました。\n';
        errorMessage += '対処法: ネットワーク環境を確認して再試行してください。';
      } else if (error.message.includes('画像')) {
        errorMessage += '原因: 画像の処理中にエラーが発生しました。\n';
        errorMessage += '対処法: 画像サイズを小さくするか、画像を削除してください。';
      } else {
        errorMessage += `詳細: ${error.message}\n`;
        errorMessage += '対処法: ブラウザのコンソール（F12）を確認してください。';
      }
      
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // プレビューでのスライド切り替え
  const nextSlide = () => {
    setPreviewSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setPreviewSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  // テキスト要素を追加 - 修正版
  const addTextElement = () => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'テキストを入力',
      x: 100,
      y: 200,
      width: 300,
      height: 50,
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left',
      zIndex: getNextZIndex()
    };

    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].elements.push(newElement);
    setSlides(updatedSlides);
    setSelectedElement(newElement.id);
    
    // 新しい状態を履歴に保存
    saveToHistory(updatedSlides);
  };

  // 画像要素を追加
  const addImageElement = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 400;
          const maxHeight = 300;
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          const newElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            src: e.target.result,
            content: '',
            x: 100,
            y: 100,
            width: Math.round(width),
            height: Math.round(height),
            zIndex: getNextZIndex()
          };

          const updatedSlides = [...slides];
          updatedSlides[currentSlideIndex].elements.push(newElement);
          setSlides(updatedSlides);
          setSelectedElement(newElement.id);
          
          // 新しい状態を履歴に保存
          saveToHistory(updatedSlides);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  // 図形要素を追加 - 修正版
  const addShapeElement = (shapeType) => {
    const newElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType: shapeType,
      content: '',
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      fillColor: '#3498db',
      borderColor: '#2980b9',
      borderWidth: 2,
      zIndex: getNextZIndex()
    };

    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].elements.push(newElement);
    setSlides(updatedSlides);
    setSelectedElement(newElement.id);
    
    // 新しい状態を履歴に保存
    saveToHistory(updatedSlides);
  };

  // 次のzIndexを取得
  const getNextZIndex = () => {
    const maxZ = Math.max(0, ...slides[currentSlideIndex].elements.map(el => el.zIndex || 0));
    return maxZ + 1;
  };

  // 要素の重なり順を変更 - 修正版
  const changeZIndex = (elementId, direction) => {
    const updatedSlides = [...slides];
    const elements = updatedSlides[currentSlideIndex].elements;
    const element = elements.find(el => el.id === elementId);
    
    if (direction === 'front') {
      element.zIndex = getNextZIndex();
    } else if (direction === 'back') {
      element.zIndex = 0;
      elements.forEach(el => {
        if (el.id !== elementId && el.zIndex >= 0) {
          el.zIndex += 1;
        }
      });
    }
    
    setSlides(updatedSlides);
    
    // 新しい状態を履歴に保存
    saveToHistory(updatedSlides);
  };

  // 要素をコピー
  const copyElement = (elementId) => {
    const element = slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element) {
      setClipboard(JSON.parse(JSON.stringify(element)));
    }
  };

  // 要素をペースト - 修正版
  const pasteElement = () => {
    if (clipboard) {
      const newElement = {
        ...clipboard,
        id: `${clipboard.type}-${Date.now()}`,
        x: clipboard.x + 20,
        y: clipboard.y + 20,
        zIndex: getNextZIndex()
      };

      const updatedSlides = [...slides];
      updatedSlides[currentSlideIndex].elements.push(newElement);
      setSlides(updatedSlides);
      setSelectedElement(newElement.id);
      
      // 新しい状態を履歴に保存
      saveToHistory(updatedSlides);
    }
  };

  // 要素を削除 - 修正版
  const deleteElement = (elementId) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].elements = updatedSlides[currentSlideIndex].elements.filter(
      el => el.id !== elementId
    );
    setSlides(updatedSlides);
    setSelectedElement(null);
    
    // 新しい状態を履歴に保存
    saveToHistory(updatedSlides);
  };

  // 要素のプロパティを更新 - 修正版（遅延保存は削除）
  const updateElement = (elementId, updates) => {
    const updatedSlides = [...slides];
    const elementIndex = updatedSlides[currentSlideIndex].elements.findIndex(
      el => el.id === elementId
    );
    
    if (elementIndex !== -1) {
      updatedSlides[currentSlideIndex].elements[elementIndex] = {
        ...updatedSlides[currentSlideIndex].elements[elementIndex],
        ...updates
      };
      setSlides(updatedSlides);
      
      // 即座に履歴に保存（テキスト編集時は頻繁になるが、正確性を優先）
      // ただし、ドラッグ中やリサイズ中は保存しない
      if (!dragState.isDragging && !resizeState.isResizing) {
        saveToHistory(updatedSlides);
      }
    }
  };

  // スライドの背景色を変更 - 修正版
  const updateSlideBackground = (color) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].background = color;
    setSlides(updatedSlides);
    
    // 新しい状態を履歴に保存
    saveToHistory(updatedSlides);
  };

  // ドラッグ開始
  const handleMouseDown = (e, elementId) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    
    setDragState({
      isDragging: true,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      elementId: elementId
    });
    
    setSelectedElement(elementId);
  };

  // リサイズ開始
  const handleResizeMouseDown = (e, elementId, handle) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = slides[currentSlideIndex].elements.find(el => el.id === elementId);
    
    setResizeState({
      isResizing: true,
      handle: handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      elementId: elementId
    });
  };

  // ドラッグ中
  const handleMouseMove = (e) => {
    if (dragState.isDragging && dragState.elementId) {
      const slideContainer = document.querySelector('.slide-container');
      if (!slideContainer) return;

      const rect = slideContainer.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragState.startX;
      const newY = e.clientY - rect.top - dragState.startY;

      const element = slides[currentSlideIndex].elements.find(el => el.id === dragState.elementId);
      if (!element) return;

      const maxX = 800 - element.width;
      const maxY = 450 - element.height;
      
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      updateElement(dragState.elementId, { x: constrainedX, y: constrainedY });
    }

    if (resizeState.isResizing && resizeState.elementId) {
      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;
      
      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;

      switch (resizeState.handle) {
        case 'se':
          newWidth = Math.max(20, resizeState.startWidth + deltaX);
          newHeight = Math.max(20, resizeState.startHeight + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(20, resizeState.startWidth - deltaX);
          newHeight = Math.max(20, resizeState.startHeight + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(20, resizeState.startWidth + deltaX);
          newHeight = Math.max(20, resizeState.startHeight - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(20, resizeState.startWidth - deltaX);
          newHeight = Math.max(20, resizeState.startHeight - deltaY);
          break;
      }

      updateElement(resizeState.elementId, { width: newWidth, height: newHeight });
    }
  };

  // ドラッグ終了 - 修正版
  const handleMouseUp = () => {
    if (dragState.isDragging || resizeState.isResizing) {
      // ドラッグ・リサイズ完了後に履歴保存
      saveToHistory(slides);
    }
    
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      elementId: null
    });

    setResizeState({
      isResizing: false,
      handle: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      elementId: null
    });
  };

  // キーボードイベント
  const handleKeyDown = (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    if (e.key === 'Delete' && selectedElement) {
      deleteElement(selectedElement);
    } else if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'c':
          if (selectedElement) {
            e.preventDefault();
            copyElement(selectedElement);
          }
          break;
        case 'v':
          e.preventDefault();
          pasteElement();
          break;
      }
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dragState, resizeState, selectedElement, slides, currentSlideIndex]);

  // スライド配列が変更された時の安全性チェック
  React.useEffect(() => {
    if (slides.length === 0) {
      // スライドが空の場合はデフォルトスライドを作成
      const defaultSlide = {
        id: Date.now(),
        title: 'スライド 1',
        background: '#ffffff',
        elements: []
      };
      setSlides([defaultSlide]);
      setCurrentSlideIndex(0);
      setSelectedElement(null);
    } else if (currentSlideIndex >= slides.length) {
      // 現在のインデックスが範囲外の場合は最後のスライドに移動
      setCurrentSlideIndex(slides.length - 1);
      setSelectedElement(null);
    }
  }, [slides.length, currentSlideIndex]);

  // 現在のスライドが変更された時にサムネイル一覧をスクロール
  React.useEffect(() => {
    console.log('currentSlideIndex changed to:', currentSlideIndex);
    const thumbnailsContainer = document.querySelector('.slide-thumbnails');
    const activeThumbnail = document.querySelector('.slide-thumbnail.active');
    
    if (thumbnailsContainer && activeThumbnail) {
      const containerRect = thumbnailsContainer.getBoundingClientRect();
      const thumbnailRect = activeThumbnail.getBoundingClientRect();
      
      if (thumbnailRect.top < containerRect.top || thumbnailRect.bottom > containerRect.bottom) {
        activeThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentSlideIndex]);

  // 安全にcurrentSlideを取得
  const getCurrentSlide = () => {
    if (slides.length === 0) {
      return {
        id: 'default',
        title: 'スライド 1',
        background: '#ffffff',
        elements: []
      };
    }
    
    const safeIndex = Math.max(0, Math.min(currentSlideIndex, slides.length - 1));
    return slides[safeIndex] || {
      id: 'fallback',
      title: 'スライド 1',
      background: '#ffffff',
      elements: []
    };
  };

  const currentSlide = getCurrentSlide();

  // 図形を描画する関数
  const renderShape = (element) => {
    const { shapeType, fillColor, borderColor, borderWidth } = element;
    
    switch (shapeType) {
      case 'rectangle':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: fillColor,
              border: `${borderWidth}px solid ${borderColor}`
            }}
          />
        );
      case 'circle':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: fillColor,
              border: `${borderWidth}px solid ${borderColor}`,
              borderRadius: '50%'
            }}
          />
        );
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${element.width / 2}px solid transparent`,
              borderRight: `${element.width / 2}px solid transparent`,
              borderBottom: `${element.height}px solid ${fillColor}`,
              position: 'relative'
            }}
          />
        );
      default:
        return null;
    }
  };

  // サムネイル用の図形を描画する関数
  const renderThumbnailShape = (element, scale) => {
    const { shapeType, fillColor, borderColor, borderWidth } = element;
    const scaledBorderWidth = Math.max(1, borderWidth * scale);
    
    switch (shapeType) {
      case 'rectangle':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: fillColor,
              border: `${scaledBorderWidth}px solid ${borderColor}`
            }}
          />
        );
      case 'circle':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: fillColor,
              border: `${scaledBorderWidth}px solid ${borderColor}`,
              borderRadius: '50%'
            }}
          />
        );
      case 'triangle':
        const scaledWidth = element.width * scale;
        const scaledHeight = element.height * scale;
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${scaledWidth / 2}px solid transparent`,
              borderRight: `${scaledWidth / 2}px solid transparent`,
              borderBottom: `${scaledHeight}px solid ${fillColor}`,
              position: 'relative'
            }}
          />
        );
      default:
        return null;
    }
  };

  // リサイズハンドルを描画
  const renderResizeHandles = (elementId) => {
    if (selectedElement !== elementId) return null;

    return (
      <>
        <div 
          className="resize-handle nw" 
          onMouseDown={(e) => handleResizeMouseDown(e, elementId, 'nw')}
        />
        <div 
          className="resize-handle ne" 
          onMouseDown={(e) => handleResizeMouseDown(e, elementId, 'ne')}
        />
        <div 
          className="resize-handle sw" 
          onMouseDown={(e) => handleResizeMouseDown(e, elementId, 'sw')}
        />
        <div 
          className="resize-handle se" 
          onMouseDown={(e) => handleResizeMouseDown(e, elementId, 'se')}
        />
      </>
    );
  };

  if (isPreview) {
    const previewSlide = slides[previewSlideIndex];
    
    return (
      <div className="preview-mode">
        <div className="preview-header">
          <button onClick={() => setIsPreview(false)}>編集に戻る</button>
          <h2>{previewSlide.title} ({previewSlideIndex + 1}/{slides.length})</h2>
          <div className="preview-controls">
            <button onClick={prevSlide} disabled={previewSlideIndex === 0}>前へ</button>
            <button onClick={nextSlide} disabled={previewSlideIndex === slides.length - 1}>次へ</button>
          </div>
        </div>
        <div className="preview-slide" style={{ backgroundColor: previewSlide.background }}>
          {previewSlide.elements
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map((element) => (
            <div
              key={element.id}
              className="preview-element"
              style={{
                position: 'absolute',
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fontSize: element.fontSize,
                fontWeight: element.fontWeight,
                color: element.color,
                textAlign: element.textAlign,
                zIndex: element.zIndex || 0
              }}
            >
              {element.type === 'text' && (
                <div style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  color: 'inherit',
                  textAlign: 'inherit',
                  whiteSpace: 'pre-wrap'
                }}>
                  {element.content}
                </div>
              )}
              {element.type === 'image' && (
                <img 
                  src={element.src} 
                  alt="スライド画像" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {element.type === 'shape' && renderShape(element)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="slide-editor">
      {/* 隠しファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* サイドバー - スライド一覧 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <h3>スライド</h3>
            <span className="slide-count">({slides.length}枚)</span>
          </div>
          <button className="add-slide-btn" onClick={addSlide}>
            + 追加
          </button>
        </div>
        <div className="slide-thumbnails">
          {slides.map((slide, index) => {
            console.log('Rendering slide', index, 'active:', index === currentSlideIndex);
            return (
              <div
                key={slide.id}
                className={`slide-thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
                onClick={() => handleSlideClick(index)}
              >
                <div 
                  className="thumbnail-preview"
                  style={{ backgroundColor: slide.background }}
                >
                  {slide.elements
                    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((element) => {
                      const scaledElement = {
                        ...element,
                        x: Math.round(element.x * SCALE_FACTOR),
                        y: Math.round(element.y * SCALE_FACTOR),
                        width: Math.max(1, Math.round(element.width * SCALE_FACTOR)),
                        height: Math.max(1, Math.round(element.height * SCALE_FACTOR)),
                        fontSize: Math.max(4, Math.round(element.fontSize * SCALE_FACTOR))
                      };

                      return (
                        <div
                          key={element.id}
                          className="thumbnail-element"
                          style={{
                            position: 'absolute',
                            left: scaledElement.x,
                            top: scaledElement.y,
                            width: scaledElement.width,
                            height: scaledElement.height,
                            fontSize: scaledElement.fontSize,
                            fontWeight: element.fontWeight,
                            color: element.color,
                            textAlign: element.textAlign,
                            zIndex: element.zIndex || 0,
                            overflow: 'hidden',
                            lineHeight: '1'
                          }}
                        >
                          {element.type === 'text' && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              fontSize: 'inherit',
                              fontWeight: 'inherit',
                              color: 'inherit',
                              textAlign: 'inherit',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-all'
                            }}>
                              {element.content || 'テキスト'}
                            </div>
                          )}
                          {element.type === 'image' && (
                            <img 
                              src={element.src} 
                              alt="サムネイル画像" 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                          )}
                          {element.type === 'shape' && renderThumbnailShape(element, SCALE_FACTOR)}
                        </div>
                      );
                    })}
                </div>
                
                <div className="thumbnail-title">
                  {slide.title}
                </div>
                
                <div className="thumbnail-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="duplicate-slide-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                    title="複製"
                  >
                    📄
                  </button>
                  {slides.length > 1 && (
                    <button
                      className="delete-slide-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                      title="削除"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* メインエディタエリア */}
      <div className="main-editor">
        {/* ツールバー */}
        <div className="toolbar">
          <div className="toolbar-group">
            <button onClick={undo} disabled={historyIndex <= 0}>↶ 元に戻す</button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1}>↷ やり直し</button>
          </div>
          
          <div className="toolbar-separator"></div>
          
          <div className="toolbar-group">
            <button onClick={addTextElement}>📝 テキスト</button>
            <button onClick={addImageElement}>🖼️ 画像</button>
            
            <div className="shape-dropdown">
              <button className="dropdown-btn">🔷 図形 ▼</button>
              <div className="dropdown-content">
                <button onClick={() => addShapeElement('rectangle')}>⬜ 四角形</button>
                <button onClick={() => addShapeElement('circle')}>⚫ 円</button>
                <button onClick={() => addShapeElement('triangle')}>🔺 三角形</button>
              </div>
            </div>
          </div>
          
          <div className="toolbar-separator"></div>
          
          <div className="toolbar-group">
            {selectedElement && (
              <>
                <button onClick={() => copyElement(selectedElement)}>📋 コピー</button>
                <button onClick={() => changeZIndex(selectedElement, 'front')}>⬆️ 前面</button>
                <button onClick={() => changeZIndex(selectedElement, 'back')}>⬇️ 背面</button>
              </>
            )}
            {clipboard && (
              <button onClick={pasteElement}>📄 ペースト</button>
            )}
          </div>
          
          <div className="toolbar-separator"></div>
          
          <div className="toolbar-group">
            <span className="current-slide-info">
              スライド {currentSlideIndex + 1} / {slides.length}
            </span>
          </div>
          
          <div className="toolbar-separator"></div>
          
          <div className="toolbar-group">
            <button onClick={() => {
              setPreviewSlideIndex(currentSlideIndex);
              setIsPreview(true);
            }}>
              ▶️ プレビュー
            </button>
            <button 
              onClick={exportToPowerPoint} 
              className="export-btn"
              disabled={isExporting}
            >
              {isExporting ? '📥 生成中...' : '📥 PowerPoint出力'}
            </button>
          </div>
          
          {selectedElement && (
            <div className="toolbar-group">
              <button 
                className="delete-btn"
                onClick={() => deleteElement(selectedElement)}
              >
                🗑️ 削除
              </button>
            </div>
          )}
        </div>

        {/* スライドキャンバス */}
        <div className="slide-canvas">
          <div 
            className="slide-container"
            style={{ backgroundColor: currentSlide.background }}
            onClick={() => setSelectedElement(null)}
          >
            {currentSlide.elements
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map((element) => (
              <div
                key={element.id}
                className={`slide-element ${element.type} ${
                  selectedElement === element.id ? 'selected' : ''
                }`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  fontSize: element.fontSize,
                  fontWeight: element.fontWeight,
                  color: element.color,
                  textAlign: element.textAlign,
                  cursor: dragState.isDragging && dragState.elementId === element.id ? 'grabbing' : 'grab',
                  zIndex: element.zIndex || 0
                }}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(element.id);
                }}
              >
                {element.type === 'text' && (
                  <textarea
                    value={element.content}
                    onChange={(e) => updateElement(element.id, { content: e.target.value })}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: 'transparent',
                      resize: 'none',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      color: 'inherit',
                      textAlign: 'inherit',
                      cursor: dragState.isDragging ? 'grabbing' : 'text'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                )}
                {element.type === 'image' && (
                  <img 
                    src={element.src} 
                    alt="スライド画像" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      pointerEvents: 'none'
                    }}
                  />
                )}
                {element.type === 'shape' && renderShape(element)}
                
                {renderResizeHandles(element.id)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* プロパティパネル */}
      <div className="properties-panel">
        {!selectedElement ? (
          <div>
            <h4>スライド設定</h4>
            <div className="property-group">
              <label>背景色</label>
              <input
                type="color"
                value={currentSlide?.background || '#ffffff'}
                onChange={(e) => updateSlideBackground(e.target.value)}
              />
            </div>
            <div className="property-group">
              <label>スライドタイトル</label>
              <input
                type="text"
                value={currentSlide?.title || ''}
                onChange={(e) => {
                  if (slides.length > 0 && currentSlideIndex < slides.length) {
                    const updatedSlides = [...slides];
                    updatedSlides[currentSlideIndex].title = e.target.value;
                    setSlides(updatedSlides);
                    saveToHistory(updatedSlides);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          (() => {
            const element = currentSlide?.elements?.find(el => el.id === selectedElement);
            if (!element) return (
              <div>
                <h4>要素が見つかりません</h4>
                <p>選択された要素が存在しません。</p>
                <button onClick={() => setSelectedElement(null)}>選択解除</button>
              </div>
            );

            return (
              <div>
                <h4>要素プロパティ</h4>
                <div className="property-group">
                  <label>X座標</label>
                  <input
                    type="number"
                    value={element.x || 0}
                    onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="property-group">
                  <label>Y座標</label>
                  <input
                    type="number"
                    value={element.y || 0}
                    onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="property-group">
                  <label>幅</label>
                  <input
                    type="number"
                    value={element.width || 100}
                    onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="property-group">
                  <label>高さ</label>
                  <input
                    type="number"
                    value={element.height || 100}
                    onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                {element.type === 'text' && (
                  <>
                    <div className="property-group">
                      <label>フォントサイズ</label>
                      <input
                        type="number"
                        value={element.fontSize || 16}
                        onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) || 12 })}
                      />
                    </div>
                    <div className="property-group">
                      <label>フォント太さ</label>
                      <select
                        value={element.fontWeight || 'normal'}
                        onChange={(e) => updateElement(selectedElement, { fontWeight: e.target.value })}
                      >
                        <option value="normal">標準</option>
                        <option value="bold">太字</option>
                      </select>
                    </div>
                    <div className="property-group">
                      <label>文字色</label>
                      <input
                        type="color"
                        value={element.color || '#000000'}
                        onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                      />
                    </div>
                    <div className="property-group">
                      <label>文字揃え</label>
                      <select
                        value={element.textAlign || 'left'}
                        onChange={(e) => updateElement(selectedElement, { textAlign: e.target.value })}
                      >
                        <option value="left">左揃え</option>
                        <option value="center">中央揃え</option>
                        <option value="right">右揃え</option>
                      </select>
                    </div>
                  </>
                )}

                {element.type === 'shape' && (
                  <>
                    <div className="property-group">
                      <label>塗りつぶし色</label>
                      <input
                        type="color"
                        value={element.fillColor || '#3498db'}
                        onChange={(e) => updateElement(selectedElement, { fillColor: e.target.value })}
                      />
                    </div>
                    <div className="property-group">
                      <label>境界線色</label>
                      <input
                        type="color"
                        value={element.borderColor || '#2980b9'}
                        onChange={(e) => updateElement(selectedElement, { borderColor: e.target.value })}
                      />
                    </div>
                    <div className="property-group">
                      <label>境界線の太さ</label>
                      <input
                        type="number"
                        value={element.borderWidth || 2}
                        onChange={(e) => updateElement(selectedElement, { borderWidth: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </>
                )}

                <div className="property-group">
                  <label>重なり順</label>
                  <div className="z-index-controls">
                    <button onClick={() => changeZIndex(selectedElement, 'front')}>最前面へ</button>
                    <button onClick={() => changeZIndex(selectedElement, 'back')}>最背面へ</button>
                  </div>
                </div>
                
                <div className="property-group">
                  <button 
                    className="delete-element-btn"
                    onClick={() => deleteElement(selectedElement)}
                  >
                    この要素を削除
                  </button>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default SlideEditor;