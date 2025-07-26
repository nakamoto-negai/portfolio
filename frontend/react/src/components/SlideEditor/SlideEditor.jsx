import React, { useState } from 'react';
import './SlideEditor.css';

const SlideEditor = () => {
  // スライドのデータ構造
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: 'スライド 1',
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
          fontWeight: 'bold'
        }
      ]
    }
  ]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);

  // 新しいスライドを追加
  const addSlide = () => {
    const newSlide = {
      id: slides.length + 1,
      title: `スライド ${slides.length + 1}`,
      elements: []
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  // テキスト要素を追加
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
      fontWeight: 'normal'
    };

    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].elements.push(newElement);
    setSlides(updatedSlides);
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

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="slide-editor">
      {/* サイドバー - スライド一覧 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>スライド</h3>
          <button className="add-slide-btn" onClick={addSlide}>
            + 追加
          </button>
        </div>
        <div className="slide-thumbnails">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide-thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
              onClick={() => setCurrentSlideIndex(index)}
            >
              <div className="thumbnail-content">
                <span>{slide.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* メインエディタエリア */}
      <div className="main-editor">
        {/* ツールバー */}
        <div className="toolbar">
          <button onClick={addTextElement}>テキスト追加</button>
          <button>画像追加</button>
          <button>図形追加</button>
          <button>プレビュー</button>
        </div>

        {/* スライドキャンバス */}
        <div className="slide-canvas">
          <div className="slide-container">
            {currentSlide.elements.map((element) => (
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
                  fontWeight: element.fontWeight
                }}
                onClick={() => setSelectedElement(element.id)}
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
                      fontWeight: 'inherit'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* プロパティパネル */}
      {selectedElement && (
        <div className="properties-panel">
          <h4>プロパティ</h4>
          {/* ここに選択された要素のプロパティ編集UI */}
          <div className="property-group">
            <label>フォントサイズ</label>
            <input
              type="number"
              value={currentSlide.elements.find(el => el.id === selectedElement)?.fontSize || 16}
              onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideEditor;