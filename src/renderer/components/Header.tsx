import React, { useEffect, useState } from "react";
import { Headphones } from "@deemlol/next-icons";

const Header: React.FC = () => {
  const [appInfo, setAppInfo] = useState<
    { version: string; name: string; platform: string } | null
  >(null);

  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        // @ts-ignore - electronAPIはcontextBridgeで定義されているため
        const info = await window.electronAPI.getAppInfo();
        setAppInfo(info);
      } catch (error) {
        console.error("アプリ情報の取得に失敗しました:", error);
      }
    };

    fetchAppInfo();
  }, []);

  return (
    <>
      {appInfo && (
        <div className="text-xs text-gray-600 dark:text-gray-300 text-center bg-gray-100 dark:bg-gray-800 rounded-sm px-2 py-1 absolute top-2 right-2">
          <code>v{appInfo.version}</code>
        </div>
      )}

      {/* LINEロゴ */}
      <div className="mb-5 w-22 h-22 bg-line-green rounded-full flex items-center justify-center p-5">
        <Headphones size="100%" color="#ffffff" />
      </div>

      {/* タイトルと説明 */}
      <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white ml-1">
        LINE着信音置換<span className="text-xs">くん</span>
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-8 text-sm">
        音声ファイルを選択するだけで<br />
        LINEの着信音を簡単に変更できます
      </p>
    </>
  );
};

export default Header;
