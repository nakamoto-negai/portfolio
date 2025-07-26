class Powerpoint < ApplicationRecord
  # アソシエーション
  belongs_to :portfolio
  
  # Active Storageでファイル添付
  has_one_attached :file
  
  # バリデーション
  validates :filename, presence: true, length: { maximum: 255 }
  validates :portfolio_id, presence: true
  validates :file_size, presence: true, numericality: { greater_than: 0 }
  validates :content_type, presence: true
  
  # ファイル形式のバリデーション
  validate :acceptable_file_format
  
  # スコープ
  scope :generated, -> { where(is_generated: true) }
  scope :uploaded, -> { where(is_generated: false) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_size, -> { order(:file_size) }
  
  # コールバック
  before_validation :set_file_attributes, if: :file_attached?
  after_create :update_generated_at, if: :is_generated?
  
  # インスタンスメソッド
  def generated?
    is_generated
  end
  
  def uploaded?
    !is_generated
  end
  
  def file_size_human
    return '不明' unless file_size
    
    if file_size < 1024
      "#{file_size} B"
    elsif file_size < 1024 * 1024
      "#{(file_size / 1024.0).round(1)} KB"
    else
      "#{(file_size / (1024.0 * 1024.0)).round(1)} MB"
    end
  end
  
  def download_filename
    original_filename.present? ? original_filename : filename
  end
  
  # ポートフォリオの情報を取得
  def portfolio_title
    portfolio&.title
  end
  
  def portfolio_description
    portfolio&.description
  end
  
  # ファイルの存在確認
  def file_exists?
    file.attached? && file.blob.present?
  end
  
  # メタデータの更新
  def update_metadata!(new_metadata)
    update!(metadata: (metadata || {}).merge(new_metadata))
  end
  
  # ファイルの削除
  def purge_file!
    file.purge if file.attached?
  end
  
  # ファイルが添付されているかチェック
  def file_attached?
    file.attached?
  end
  
  # クラスメソッド
  class << self
    def total_file_size
      sum(:file_size) || 0
    end
    
    def average_file_size
      average(:file_size)&.round(2) || 0
    end
    
    def find_by_portfolio_and_filename(portfolio_id, filename)
      find_by(portfolio_id: portfolio_id, filename: filename)
    end
    
    # ポートフォリオからPowerPointファイルを一括作成
    def create_from_files(portfolio, files)
      files.map.with_index do |file, index|
        powerpoint = portfolio.powerpoints.build(
          filename: file.original_filename,
          original_filename: file.original_filename,
          description: "ポートフォリオ作成時にアップロードされたファイル #{index + 1}",
          is_generated: false
        )
        powerpoint.file.attach(file)
        powerpoint.save!
        powerpoint
      end
    end
  end
  
  private
  
  def acceptable_file_format
    return unless file.attached?
    
    acceptable_types = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint'
    ]
    
    unless acceptable_types.include?(file.blob.content_type)
      errors.add(:file, 'はPowerPointファイル（.pptx または .ppt）である必要があります')
    end
  end
  
  def set_file_attributes
    return unless file.attached?
    
    self.content_type = file.blob.content_type
    self.file_size = file.blob.byte_size
    self.original_filename = file.blob.filename.to_s if original_filename.blank?
    self.filename = original_filename if filename.blank?
  end
  
  def update_generated_at
    update_columns(generated_at: Time.current) if generated_at.blank?
  end
end