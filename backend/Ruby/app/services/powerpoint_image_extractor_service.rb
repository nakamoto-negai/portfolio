require 'zip'
require 'mini_magick'

class PowerpointImageExtractorService
  def initialize(portfolio, powerpoint)
    @portfolio = portfolio
    @powerpoint = powerpoint
  end

  def extract_main_image
    return false unless @powerpoint.file.attached?

    temp_file = nil
    extracted_image = nil

    begin
      # PowerPointファイルをダウンロード
      temp_file = download_powerpoint_file
      
      # ZIPファイルとして開いて画像を抽出
      extracted_image = extract_first_image_from_pptx(temp_file.path)
      
      if extracted_image
        attach_main_image(extracted_image)
        Rails.logger.info "Successfully extracted main image for portfolio #{@portfolio.id}"
        return true
      else
        Rails.logger.warn "No image found in PowerPoint file for portfolio #{@portfolio.id}"
        return false
      end

    rescue => e
      Rails.logger.error "Error extracting image from PowerPoint: #{e.message}"
      return false
    ensure
      # 一時ファイルのクリーンアップ
      temp_file&.close
      temp_file&.unlink
      extracted_image&.close
      extracted_image&.unlink if extracted_image.respond_to?(:unlink)
    end
  end

  private

  def download_powerpoint_file
    temp_file = Tempfile.new(['powerpoint', '.pptx'])
    temp_file.binmode
    temp_file.write(@powerpoint.file.download)
    temp_file.rewind
    temp_file
  end

  def extract_first_image_from_pptx(pptx_path)
    Zip::File.open(pptx_path) do |zip_file|
      # PowerPointの画像は通常 ppt/media/ フォルダに格納される
      media_entries = zip_file.entries.select do |entry|
        entry.name.start_with?('ppt/media/') && 
        entry.name.match?(/\.(png|jpg|jpeg|gif|bmp)$/i)
      end

      return nil if media_entries.empty?

      # 最初の画像を取得
      first_image_entry = media_entries.first
      
      # 一時ファイルに画像を保存
      temp_image = Tempfile.new(['extracted_image', File.extname(first_image_entry.name)])
      temp_image.binmode
      
      zip_file.get_input_stream(first_image_entry) do |input_stream|
        temp_image.write(input_stream.read)
      end
      
      temp_image.rewind
      
      # MiniMagickで画像を処理してサムネイルサイズに変換
      process_image(temp_image)
    end
  end

  def process_image(temp_image)
    processed_image = Tempfile.new(['processed_image', '.jpg'])
    
    MiniMagick::Tool::Convert.new do |convert|
      convert << temp_image.path
      convert.resize('800x600>')  # 最大800x600のサイズにリサイズ
      convert.quality('85')       # JPEG品質を85%に設定
      convert.format('jpg')       # JPEG形式に変換
      convert << processed_image.path
    end
    
    processed_image.rewind
    processed_image
  rescue => e
    Rails.logger.error "Error processing image: #{e.message}"
    temp_image # 処理に失敗した場合は元の画像を返す
  ensure
    temp_image&.close
    temp_image&.unlink
  end

  def attach_main_image(image_file)
    filename = "portfolio_#{@portfolio.id}_main_image.jpg"
    
    @portfolio.main_image.attach(
      io: image_file,
      filename: filename,
      content_type: 'image/jpeg'
    )
  end
end