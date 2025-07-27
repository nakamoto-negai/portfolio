# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# サンプルデータの作成

# ポートフォリオのサンプルデータ
portfolios_data = [
  {
    title: "Webデザインポートフォリオ",
    description: "モダンなWebデザインのプロジェクト集です。レスポンシブデザインとユーザビリティを重視した作品を展示しています。",
    is_public: true
  },
  {
    title: "モバイルアプリ開発",
    description: "React NativeとFlutterで開発したモバイルアプリケーションのプロジェクトです。",
    is_public: true
  },
  {
    title: "イラスト作品集",
    description: "デジタルイラストとキャラクターデザインの作品集です。",
    is_public: false
  }
]

# スライドのサンプルデータ（画像URL）
sample_images = [
  "https://picsum.photos/800/600?random=1",
  "https://picsum.photos/800/600?random=2", 
  "https://picsum.photos/800/600?random=3",
  "https://picsum.photos/800/600?random=4",
  "https://picsum.photos/800/600?random=5",
  "https://picsum.photos/800/600?random=6",
  "https://picsum.photos/800/600?random=7",
  "https://picsum.photos/800/600?random=8",
  "https://picsum.photos/800/600?random=9",
  "https://picsum.photos/800/600?random=10"
]

puts "Creating sample portfolios..."

portfolios_data.each_with_index do |portfolio_data, index|
  portfolio = Portfolio.find_or_create_by(title: portfolio_data[:title]) do |p|
    p.description = portfolio_data[:description]
    p.is_public = portfolio_data[:is_public]
  end
  puts "Created portfolio: #{portfolio.title}"
  
  # 既存のスライドがない場合のみ作成
  if portfolio.slides.empty?
    # 各ポートフォリオに3-5枚のスライドを追加
    slide_count = rand(3..5)
    
    slide_count.times do |slide_index|
      slide = portfolio.slides.create!(
        image_url: sample_images[(index * 5 + slide_index) % sample_images.length],
        page_number: slide_index + 1
      )
      puts "  Created slide #{slide.page_number} for #{portfolio.title}"
    end
  end
end

puts "\nSample data created successfully!"
puts "Portfolios: #{Portfolio.count}"
puts "Slides: #{Slide.count}"
