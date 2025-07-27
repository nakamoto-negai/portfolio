import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getComments, createComment, updateComment, deleteComment } from '../../api/comments';
import './Comments.css';

const Comments = ({ portfolioId, portfolioOwner }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [portfolioId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getComments(portfolioId);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      await createComment(portfolioId, newComment);
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('コメントの投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(portfolioId, commentId, editContent);
      setEditingId(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('コメントの更新に失敗しました');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('このコメントを削除しますか？')) return;

    try {
      await deleteComment(portfolioId, commentId);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('コメントの削除に失敗しました');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comments-section">
      <h2 className="comments-title">コメント ({comments.length})</h2>

      {user && (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="comment-input"
            rows="3"
            maxLength="500"
          />
          <div className="comment-form-actions">
            <span className="char-count">{newComment.length}/500</span>
            <button 
              type="submit" 
              className="comment-submit-btn"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? '投稿中...' : 'コメントする'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="comments-loading">コメントを読み込み中...</div>
      ) : comments.length === 0 ? (
        <p className="no-comments">まだコメントがありません</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <span className="author-name">{comment.user?.name || '不明'}</span>
                  {comment.user?.id === portfolioOwner?.id && (
                    <span className="owner-badge">作成者</span>
                  )}
                </div>
                <div className="comment-meta">
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                  {user && comment.user?.id === user.id && (
                    <div className="comment-actions">
                      <button
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="comment-action-btn"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="comment-action-btn delete"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingId === comment.id ? (
                <div className="comment-edit">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="comment-edit-input"
                    rows="3"
                    maxLength="500"
                  />
                  <div className="comment-edit-actions">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      className="comment-save-btn"
                      disabled={!editContent.trim()}
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className="comment-cancel-btn"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <p className="comment-content">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!user && (
        <p className="login-prompt">
          コメントするには<a href="/login">ログイン</a>が必要です
        </p>
      )}
    </div>
  );
};

export default Comments;