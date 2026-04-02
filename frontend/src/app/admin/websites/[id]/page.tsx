'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Website {
  ID: number;
  WebsiteName: string;
  GhiChu: string;
}

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [tenThongTin, setTenThongTin] = useState('');
  const [noiDungThongTin, setNoiDungThongTin] = useState('');
  const editorRef = useRef<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    fetchWebsite();
    loadCKEditor();
  }, [websiteId]);

  const fetchWebsite = async () => {
    try {
      const res = await fetch(`/api/websites/${websiteId}`);
      const data = await res.json();

      if (res.ok && data.data) {
        setWebsite(data.data);
        setTenThongTin(data.data.WebsiteName || '');
        setNoiDungThongTin(data.data.GhiChu || '');
      }
    } catch (err) {
      setError('Failed to load website data');
    } finally {
      setLoading(false);
    }
  };

  const loadCKEditor = async () => {
    // Dynamically load CKEditor
    if (typeof window !== 'undefined' && !editorLoaded) {
      const script = document.createElement('script');
      script.src = '/ckeditor/ckeditor.js';
      script.async = true;
      script.onload = () => {
        setEditorLoaded(true);
      };
      document.head.appendChild(script);
    }
  };

  useEffect(() => {
    if (editorLoaded && typeof window !== 'undefined' && (window as any).CKEDITOR) {
      if (editorRef.current) {
        const editor = (window as any).CKEDITOR.replace(editorRef.current);
        editor.on('change', (evt: any) => {
          setNoiDungThongTin(evt.editor.getData());
        });
      }
    }
  }, [editorLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenThongTin.trim()) {
      setError('Vui lòng nhập tên thông tin');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/websites/${websiteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteName: tenThongTin,
          ghiChu: noiDungThongTin,
        }),
      });

      if (res.ok) {
        setSuccess('Cập nhật thành công');
        setTimeout(() => {
          router.push('/admin/websites');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.message || 'Có lỗi trong quá trình cập nhật');
      }
    } catch (err) {
      setError('Có lỗi trong quá trình cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <div className="mytab">
        <a href="/admin/websites">Danh sách website</a>
        | <a href="#" style={{ backgroundColor: 'darkgray' }}>Chi tiết website</a>
      </div>

      <h1 className="titlead">THÔNG TIN WEBSITE</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: 'green', marginBottom: '10px' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ width: '150px' }}>Tên thông tin</td>
              <td>
                <input
                  type="text"
                  id="tbTenThongTin"
                  value={tenThongTin}
                  onChange={(e) => setTenThongTin(e.target.value)}
                  style={{ width: '100%' }}
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <textarea
                  id="tbNoiDungThongTin"
                  ref={editorRef}
                  value={noiDungThongTin}
                  onChange={(e) => setNoiDungThongTin(e.target.value)}
                  style={{ width: '100%', minHeight: '300px' }}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <style jsx>{`
        .mytab {
          margin-bottom: 15px;
        }
        .mytab a {
          padding: 5px 10px;
          text-decoration: none;
          color: #337ab7;
        }
        .titlead {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}
