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

  const fileInputRef = useRef(null);

  // 履歴管理
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(slides)));
    setHistory(newHistory.slice(-50));
    setHistoryIndex(newHistory.length - 1);
  }, [slides, history, historyIndex]);

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSlides(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSlides(history[historyIndex + 1]);
    }
  };

  // スライド間のナビゲーション（最もシンプルな実装）
  const handleSlideClick = (index) => {
    console.log('Slide clicked:', index, 'Current:', currentSlideIndex);
    setCurrentSlideIndex(index);
    setSelectedElement(null);
  };

  // 新しいスライドを追加
  const addSlide = () => {
    saveToHistory();
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
  };

  // スライドを複製
  const duplicateSlide = (slideIndex) => {
    saveToHistory();
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
  };

  // スライドを削除
  const deleteSlide = (slideIndex) => {
    if (slides.length <= 1) return;
    
    saveToHistory();
    const updatedSlides = slides.filter((_, index) => index !== slideIndex);
    setSlides(updatedSlides);
    
    if (slideIndex === currentSlideIndex) {
      setCurrentSlideIndex(Math.max(0, slideIndex - 1));
    } else if (slideIndex < currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // テキスト要素を追加
  const addTextElement = () => {
    saveToHistory();
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
  };

  // 画像要素を追加
  const addImageElement = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      saveToHistory();
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
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  // 図形要素を追加
  const addShapeElement = (shapeType) => {
    saveToHistory();
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
  };

  // 次のzIndexを取得
  const getNextZIndex = () => {
    const maxZ = Math.max(0, ...slides[currentSlideIndex].elements.map(el => el.zIndex || 0));
    return maxZ + 1;
  };

  // 要素の重なり順を変更
  const changeZIndex = (elementId, direction) => {
    saveToHistory();
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
  };

  // 要素をコピー
  const copyElement = (elementId) => {
    const element = slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element) {
      setClipboard(JSON.parse(JSON.stringify(element)));
    }
  };

  // 要素をペースト
  const pasteElement = () => {
    if (clipboard) {
      saveToHistory();
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
    }
  };

  // 要素を削除
  const deleteElement = (elementId) => {
    saveToHistory();
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].elements = updatedSlides[currentSlideIndex].elements.filter(
      el => el.id !== elementId
    );
    setSlides(updatedSlides);
    setSelectedElement(null);
  };

  // 要素のプロパティを更新
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
    }
  };

  // スライドの背景色を変更
  const updateSlideBackground = (color) => {
    saveToHistory();
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].background = color;
    setSlides(updatedSlides);
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

  // ドラッグ終了
  const handleMouseUp = () => {
    if (dragState.isDragging || resizeState.isResizing) {
      saveToHistory();
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

  // プレビューでのスライド切り替え
  const nextSlide = () => {
    setPreviewSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setPreviewSlideIndex((prev) => Math.max(prev - 1, 0));
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

  React.useEffect(() => {
    if (slides.length > 0) {
      const initialHistory = [JSON.parse(JSON.stringify(slides))];
      setHistory(initialHistory);
      setHistoryIndex(0);
    }
  }, []);

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

  const currentSlide = slides[currentSlideIndex];

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
                value={currentSlide.background}
                onChange={(e) => updateSlideBackground(e.target.value)}
              />
            </div>
            <div className="property-group">
              <label>スライドタイトル</label>
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => {
                  const updatedSlides = [...slides];
                  updatedSlides[currentSlideIndex].title = e.target.value;
                  setSlides(updatedSlides);
                }}
              />
            </div>
          </div>
        ) : (
          (() => {
            const element = currentSlide.elements.find(el => el.id === selectedElement);
            if (!element) return null;

            return (
              <div>
                <h4>要素プロパティ</h4>
                <div className="property-group">
                  <label>X座標</label>
                  <input
                    type="number"
                    value={element.x}
                    onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="property-group">
                  <label>Y座標</label>
                  <input
                    type="number"
                    value={element.y}
                    onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="property-group">
                  <label>幅</label>
                  <input
                    type="number"
                    value={element.width}
                    onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="property-group">
                  <label>高さ</label>
                  <input
                    type="number"
                    value={element.height}
                    onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                {element.type === 'text' && (
                  <>
                    <div className="property-group">
                      <label>フォントサイズ</label>
                      <input
                        type="number"
                        value={element.fontSize}
                        onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) || 12 })}
                      />
                    </div>
                    <div className="property-group">
                      <label>フォント太さ</label>
                      <select
                        value={element.fontWeight}
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
                        value={element.color}
                        onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                      />
                    </div>
                    <div className="property-group">
                      <label>文字揃え</label>
                      <select
                        value={element.textAlign}
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
                        value={element.fillColor}
                        onChange={(e) => updateElement(selectedElement, { fillColor: e.target.value })}
                      />
                    </div>
                    <div className="property-group">
                      <label>境界線色</label>
                      <input
                        type="color"
                        value={element.borderColor}
                        onChange={(e) => updateElement(selectedElement, { borderColor: e.target.value })}
                      />
                    </div>
                    <div className="property-group">
                      <label>境界線の太さ</label>
                      <input
                        type="number"
                        value={element.borderWidth}
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