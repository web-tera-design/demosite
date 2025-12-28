<?php

function theme_enqueue_assets()
{
    // Google Fonts
    wp_enqueue_style(
        'google-fonts', // ←ここを'theme-style'の依存関係と合わせる
        'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Poppins:wght@700&display=swap',
        array(),
        null
    );

    // Font Awesome
    wp_enqueue_style(
        'font-awesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
        [],
        '6.7.2',
        'all'
    );

    // Swiper
    wp_enqueue_style(
        'swiper',
        'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
        [],
        '11.0.0',
        'all'
    );
    wp_enqueue_script(
        'swiper',
        'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
        [],
        '11.0.0',
        true
    );

    // GSAP
    wp_enqueue_script(
        'gsap',
        'https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js',
        [],
        '3.12.2',
        true
    );
    // 【追加】YubinBango
    wp_enqueue_script(
        'yubinbango',
        'https://yubinbango.github.io/yubinbango/yubinbango.js',
        [],
        null,
        true
    );
    wp_enqueue_script(
        'scrolltrigger',
        'https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/ScrollTrigger.min.js',
        ['gsap'],
        '3.12.2',
        true
    );

    // メインCSS
    wp_enqueue_style(
        'theme-style',
        get_template_directory_uri() . '/dist/assets/css/style.css',
        ['google-fonts', 'font-awesome', 'swiper'],
        filemtime(get_theme_file_path('/dist/assets/css/style.css')),
        'all'
    );

    // メインJS
    wp_enqueue_script(
        'theme-script',
        get_template_directory_uri() . '/dist/assets/js/script.js',
        ['swiper', 'gsap', 'scrolltrigger', 'jquery'],
        filemtime(get_theme_file_path('/dist/assets/js/script.js')),
        true
    );
}
add_action('wp_enqueue_scripts', 'theme_enqueue_assets');

// 1. CF7の自動 <p> タグ挿入を停止
add_filter('wpcf7_autop_or_not', '__return_false');

// 2. CF7が挿入する <br> タグの自動挿入を停止 (ほぼ <p> の停止でカバーされるが念のため)
// Contact Form 7のフォーム要素全体をフックし、<br>タグを削除
function custom_wpcf7_remove_br_tags($form_html)
{
    // フォーム全体から <br> タグを削除
    return str_replace('<br>', '', $form_html);
}
add_filter('wpcf7_form_elements', 'custom_wpcf7_remove_br_tags');


function add_conditional_noindex()
{
    // 404、アーカイブ系、検索結果、タグページで noindex を適用
    if (is_404() || is_search() || is_author() || is_tag() || is_date()) {
        echo '<meta name="robots" content="noindex,follow">' . "\n";
    }
}
add_action('wp_head', 'add_conditional_noindex');

// Contact Form 7の自動挿入される<p>タグを無効化
add_filter('wpcf7_autop_or_not', '__return_false');

// 画像をContactform7に入れる
function contact_images_url()
{
    return get_stylesheet_directory_uri();
}
wpcf7_add_form_tag('indicate_images_url', 'contact_images_url');
//<img src="[indicate_images_url]/dist/assets/img/cta-label.webp" alt="月間10名限定!" width="212" height="212" />


function my_cf7_custom_submit_script()
{
    if (is_page('contact') && function_exists('wpcf7_enqueue_scripts')) {
        wp_enqueue_script(
            'cf7-custom-submit',
            get_stylesheet_directory_uri() . '/js/cf7-custom-submit.js',
            array('jquery'),
            '1.0',
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'my_cf7_custom_submit_script');
