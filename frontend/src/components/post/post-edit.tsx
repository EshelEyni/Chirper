export const PostEdit = () => {
  return (
    <div className="post-edit">
      <div className="main-container">
        <div className="post-edit-content">
          <div className="post-edit-header">
            <h2>Edit your chirp</h2>
          </div>
          <div className="post-edit-body">
            <textarea
              className="post-edit-textarea"
              placeholder="What's on your mind?"
            />
          </div>
          <div className="post-edit-footer">
            <div className="post-edit-footer-left">
              <div className="post-edit-footer-left-item">
                <i className="fas fa-image"></i>
              </div>
              <div className="post-edit-footer-left-item">
                <i className="fas fa-video"></i>
              </div>
              <div className="post-edit-footer-left-item">
                <i className="fas fa-chart-bar"></i>
              </div>
              <div className="post-edit-footer-left-item">
                <i className="fas fa-smile"></i>
              </div>
            </div>
            <div className="post-edit-footer-right">
              <button className="btn btn-primary">Chirp</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
