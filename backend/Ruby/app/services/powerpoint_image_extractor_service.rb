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
      
      # PowerPointファイルを一時ディレクトリにコピー
      temp_pptx_path = File.join(output_dir, "presentation.pptx")
      FileUtils.cp(pptx_file.path, temp_pptx_path)
      
      # LibreOfficeコマンドを実行（複数スライド対応）
      # まず各スライドごとのPNG変換を試行
      cmd = [
        'libreoffice',
        '--headless',
        '--invisible',
        '--convert-to', 'png',
        '--outdir', output_dir.to_s,
        temp_pptx_path
      ]
      
      Rails.logger.info "First attempt: Converting entire presentation"
      stdout1, stderr1, status1 = Open3.capture3(*cmd)
      Rails.logger.info "First conversion - stdout: #{stdout1}"
      Rails.logger.info "First conversion - stderr: #{stderr1}"
      Rails.logger.info "First conversion - status: #{status1.exitstatus}"
      
      # 個別スライド変換も試行（libreofficeの--export-as オプション使用）
      export_cmd = [
        'libreoffice',
        '--headless',
        '--invisible',
        '--export-as', 'png',
        '--export-slides', 'all',
        '--outdir', output_dir.to_s,
        temp_pptx_path
      ]
      
      Rails.logger.info "Second attempt: Exporting all slides individually"
      stdout2, stderr2, status2 = Open3.capture3(*export_cmd)
      Rails.logger.info "Second conversion - stdout: #{stdout2}"
      Rails.logger.info "Second conversion - stderr: #{stderr2}" 
      Rails.logger.info "Second conversion - status: #{status2.exitstatus}"

      # 変換されたファイルを詳しく調査
      all_files = Dir.entries(output_dir).reject { |f| f.start_with?('.') }
      Rails.logger.info "All files in output directory: #{all_files}"
      
      # すべてのPNGファイルを取得
      png_files = Dir.glob("#{output_dir}/*.png")
      Rails.logger.info "All PNG files found: #{png_files}"
      
      # ファイル名の詳細をログ出力
      png_files.each do |file|
        file_size = File.size(file)
        file_name = File.basename(file)
        Rails.logger.info "PNG file: #{file_name}, size: #{file_size} bytes"
      end
      
      # ファイル名でソート（スライド順序を保持）
      png_files.sort! do |a, b|
        a_name = File.basename(a, '.png')
        b_name = File.basename(b, '.png')
        
        Rails.logger.info "Comparing: #{a_name} vs #{b_name}"
        
        # presentation.png (メインファイル) を最初に
        if a_name == "presentation"
          -1
        elsif b_name == "presentation"
          1
        else
          # presentation-1, presentation-2 などの番号でソート
          a_parts = a_name.split('-')
          b_parts = b_name.split('-')
          
          if a_parts.length > 1 && b_parts.length > 1
            a_num = a_parts.last.to_i
            b_num = b_parts.last.to_i
            a_num <=> b_num
          else
            a_name <=> b_name
          end
        end
      end
      
      Rails.logger.info "Found PNG files: #{png_files}"
      
      if png_files.any?
        Rails.logger.info "Starting to process #{png_files.length} PNG files"
        
        # 既存のスライドを確認
        existing_slides_count = @portfolio.slides.count
        Rails.logger.info "Portfolio #{@portfolio.id} currently has #{existing_slides_count} slides"
        
        png_files.each_with_index do |image_path, idx|
          Rails.logger.info "Processing slide image #{idx + 1}/#{png_files.length}: #{image_path}"
          
          begin
            File.open(image_path, 'rb') do |img|
              slide = @portfolio.slides.new(page_number: idx + 1)
              Rails.logger.info "Created slide object with page_number: #{slide.page_number}"
              
              slide.image.attach(
                io: img,
                filename: "slide_#{idx + 1}.png",
                content_type: 'image/png'
              )
              Rails.logger.info "Attached image to slide"
              
              if slide.save
                Rails.logger.info "Successfully saved slide #{idx + 1} with ID: #{slide.id}"
              else
                Rails.logger.error "Slide save failed for #{idx + 1}: #{slide.errors.full_messages.join(', ')}"
              end
            end
          rescue => e
            Rails.logger.error "Error processing slide #{idx + 1}: #{e.message}"
            Rails.logger.error e.backtrace.join("\n")
          end
        end
        
        # 最終的なスライド数を確認
        final_slides_count = @portfolio.reload.slides.count
        Rails.logger.info "Portfolio #{@portfolio.id} now has #{final_slides_count} slides (was #{existing_slides_count})"
        
        FileUtils.rm_rf(output_dir)
        Rails.logger.info "Successfully processed #{png_files.length} slides, saved #{final_slides_count - existing_slides_count} new slides"
        return true
      else
        Rails.logger.error "No slide images found in #{output_dir}"
        # デバッグのためディレクトリ内容をログ出力
        Dir.entries(output_dir).each do |entry|
          Rails.logger.info "Directory content: #{entry}"
        end
        FileUtils.rm_rf(output_dir)
        return false
      end
    rescue => e
      Rails.logger.error "Error extracting slide images: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      FileUtils.rm_rf(output_dir) if defined?(output_dir) && Dir.exist?(output_dir)
      false
    end
  end
end