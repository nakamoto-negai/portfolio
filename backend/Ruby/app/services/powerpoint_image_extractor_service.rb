  # 指定したスライド番号の画像を抽出してActiveStorageに保存
  # page_number: 1始まりのスライド番号

require 'zip'
require 'mini_magick'
require 'stringio'
require 'open3'

class PowerpointImageExtractorService
  def initialize(portfolio, powerpoint)
    @portfolio = portfolio
    @powerpoint = powerpoint
  end

  # pptxの1枚目スライドを画像化してActiveStorageに保存
  def extract_main_image
    return false unless @powerpoint.file.attached?

    @powerpoint.file.open do |pptx_file|
      output_dir = Rails.root.join('tmp', "pptx_images_#{SecureRandom.hex(4)}")
      FileUtils.mkdir_p(output_dir)
      cmd = [
        'libreoffice',
        '--headless',
        '--convert-to', 'png',
        '--outdir', output_dir.to_s,
        pptx_file.path
      ]
      stdout, stderr, status = Open3.capture3(*cmd)
      Rails.logger.info "LibreOffice stdout: #{stdout}"
      Rails.logger.info "LibreOffice stderr: #{stderr}"

      # 変換された画像ファイルを取得（1枚目のみ）
      images = Dir.glob("#{output_dir}/*.png").sort
      if images.any?
        image_path = images.first
        Rails.logger.info "Extracted slide image: #{image_path}"
        File.open(image_path, 'rb') do |img|
          @portfolio.main_image.attach(
            io: img,
            filename: File.basename(image_path),
            content_type: 'image/png'
          )
        end
        FileUtils.rm_rf(output_dir)
        return true
      else
        Rails.logger.error "No slide images found in #{output_dir}"
        FileUtils.rm_rf(output_dir)
        return false
      end
    end
  rescue => e
    Rails.logger.error "Error extracting slide image: #{e.message}"
    false
  end

  def extract_all_slide_images
    return false unless @powerpoint.file.attached?

    @powerpoint.file.open do |pptx_file|
        output_dir = Rails.root.join('tmp', "pptx_images_#{SecureRandom.hex(4)}")
        FileUtils.mkdir_p(output_dir)
        cmd = [
        'libreoffice',
        '--headless',
        '--convert-to', 'png',
        '--outdir', output_dir.to_s,
        pptx_file.path
        ]
        stdout, stderr, status = Open3.capture3(*cmd)
        Rails.logger.info "LibreOffice stdout: #{stdout}"
        Rails.logger.info "LibreOffice stderr: #{stderr}"

        # 変換された全ての画像ファイルを取得
        images = Dir.glob("#{output_dir}/*.png").sort
        if images.any?
        images.each_with_index do |image_path, idx|
          Rails.logger.info "Extracted slide image: #{image_path}"
          File.open(image_path, 'rb') do |img|
            slide = @portfolio.slides.create!(page_number: idx + 1)
            slide.image.attach(
              io: img,
              filename: File.basename(image_path),
              content_type: 'image/png'
            )
            unless slide.save
              Rails.logger.error "Slide save failed: #{slide.errors.full_messages.join(', ')}"
            end
          end
        end
        FileUtils.rm_rf(output_dir)
        return true
        else
        Rails.logger.error "No slide images found in #{output_dir}"
        FileUtils.rm_rf(output_dir)
        return false
        end
    end
    rescue => e
    Rails.logger.error "Error extracting slide images: #{e.message}"
    false
  end

    def extract_slide_image(page_number)
    return false unless @powerpoint.file.attached?

    @powerpoint.file.open do |pptx_file|
      output_dir = Rails.root.join('tmp', "pptx_images_#{SecureRandom.hex(4)}")
      FileUtils.mkdir_p(output_dir)
      cmd = [
        'libreoffice',
        '--headless',
        '--convert-to', 'png',
        '--outdir', output_dir.to_s,
        pptx_file.path
      ]
      stdout, stderr, status = Open3.capture3(*cmd)
      Rails.logger.info "LibreOffice stdout: #{stdout}"
      Rails.logger.info "LibreOffice stderr: #{stderr}"

      images = Dir.glob("{output_dir}/*.png").sort
      if images.any? && page_number.between?(1, images.size)
        image_path = images[page_number - 1]
        Rails.logger.info "Extracted slide image: #{image_path}"
        File.open(image_path, 'rb') do |img|
          slide = @portfolio.slides.create!(page_number: page_number)
          slide.image.attach(
            io: img,
            filename: File.basename(image_path),
            content_type: 'image/png'
          )
        end
        FileUtils.rm_rf(output_dir)
        return true
      else
        Rails.logger.error "No slide image found for page_number={page_number} in {output_dir}"
        FileUtils.rm_rf(output_dir)
        return false
      end
    end
  rescue => e
    Rails.logger.error "Error extracting slide image: #{e.message}"
    false
  end

end