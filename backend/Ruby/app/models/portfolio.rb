class Portfolio < ApplicationRecord
  # アソシエーション
  belongs_to :user, optional: true
  has_many :slides, dependent: :destroy
  has_many :powerpoints, dependent: :destroy
  
  # Active Storage for main image
  has_one_attached :main_image

  # バリデーション
  validates :title, presence: true, length: { maximum: 100 }
  validates :description, presence: true, length: { maximum: 1000 }
  validates :is_public, inclusion: { in: [true, false] }
  
  # PowerPointファイルを一括処理するためのattrアクセサ
  attr_accessor :powerpoint_files
  
  # コールバック
  after_create :process_powerpoint_files, if: :powerpoint_files_present?

  # スコープ
  scope :published, -> { where(is_public: true) }
  scope :recent, -> { order(created_at: :desc) }
  scope :popular, -> { order(created_at: :desc) }
  
  # === PUBLIC メソッド（外部から利用されるAPI） ===
  
  def published?
    is_public
  end

  # PowerPoint関連の公開メソッド
  def has_powerpoints?
    powerpoints.exists?
  end
  
  def powerpoints_count
    powerpoints.count
  end
  
  def latest_powerpoint
    powerpoints.recent.first
  end
  
  def latest_powerpoint_filename
    latest_powerpoint&.download_filename
  end
  
  def generated_powerpoints
    powerpoints.generated
  end
  
  def uploaded_powerpoints
    powerpoints.uploaded
  end

  def total_powerpoint_size
    powerpoints.sum(:file_size) || 0  # ← 修正：正しいメソッド名
  end
  
  def total_powerpoint_size_human
    size = total_powerpoint_size
    if size < 1024
      "#{size} B"
    elsif size < 1024 * 1024
      "#{(size / 1024.0).round(1)} KB"
    else
      "#{(size / (1024.0 * 1024.0)).round(1)} MB"
    end
  end
  
  def powerpoints_total_size
    total_powerpoint_size  # エイリアスとして利用
  end

  # スライド関連の公開メソッド
  def slides_count
    slides.count
  end
  
  def ordered_slides
    slides.order(:page_number)
  end

  def thumbnail_slide
    slides.where.not(page_number: nil).order(:page_number).first
  end

  # メイン画像関連のメソッド
  def has_main_image?
    main_image.attached?
  end
  
  def main_image_url
    return nil unless has_main_image?
    Rails.application.routes.url_helpers.rails_blob_path(main_image, only_path: true)
  end
  
  def extract_main_image_from_powerpoint!
    return false unless has_powerpoints?
    
    latest_powerpoint = powerpoints.recent.first
    return false unless latest_powerpoint&.file&.attached?
    
    PowerpointImageExtractorService.new(self, latest_powerpoint).extract_main_image
  end

  # その他の公開メソッド
  def likes_count
    0  # 固定値を返す
  end
  
  def toggle_publication!
    update!(is_public: !is_public)
  end

  def powerpoint_files_present?
    powerpoint_files.present? && powerpoint_files.any?(&:present?)
  end

  # === PRIVATE メソッド（内部実装、外部から呼び出し禁止） ===
  private
  
  # ファイル存在チェック（内部処理用）
  
  
  # ファイル処理ロジック（内部処理用）
  def process_powerpoint_files
    return unless powerpoint_files.present?
    
    puts "Processing #{powerpoint_files.count} PowerPoint files for portfolio: #{title}"
    
    powerpoint_files.each_with_index do |file, index|
      next if file.blank?
      
      begin
        puts "Processing file #{index + 1}: #{file.original_filename}"
        
        powerpoint = powerpoints.build(
          filename: file.original_filename,
          original_filename: file.original_filename,
          description: "ポートフォリオ作成時にアップロードされたファイル #{index + 1}",
          is_generated: false,
          file_size: file.size,
          content_type: file.content_type
        )
        
        powerpoint.file.attach(file)
        powerpoint.save!
        
        puts "Successfully saved PowerPoint: #{powerpoint.filename}"
      rescue StandardError => e
        puts "Error processing file #{file.original_filename}: #{e.message}"
        Rails.logger.error "PowerPoint file processing error: #{e.message}"
      end
    end
    
    # PowerPointファイル処理後にメイン画像を抽出
    extract_main_image_from_powerpoint!

    puts "Finished processing PowerPoint files. Total saved: #{powerpoints.count}"
  end
end
