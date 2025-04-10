pub mod db;
pub mod handlers;
pub mod parsers;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init());
    let migrations = crate::db::migrations::get_migrations();

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
    }

    builder = builder.plugin(
        tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:insighter.db", migrations)
            .build(),
    );

    builder = builder.invoke_handler(tauri::generate_handler![
        crate::handlers::parsers::parse_csv,
    ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
