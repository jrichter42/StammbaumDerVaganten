using System;
using System.IO;

namespace StammbaumDerVaganten
{
    public enum FileExtension
    {
        JSON,
        XML
    }

    public class FileHelper
    {
        public static string FileExtensionToString(FileExtension extension)
        {
            switch (extension)
            {
                case FileExtension.JSON:
                    return "json";
                case FileExtension.XML:
                    return "xml";
            }
            return null;
        }
    }

    public struct FileInfo
    {
        public string Path;
        public string Name;
        public FileExtension Extension;

        public string FilePath
        {
            get
            {
                return Path + "/" + Name + "." + FileHelper.FileExtensionToString(Extension);
            }
        }

        public FileInfo(string path, string name, FileExtension extension)
        {
            Path = path;
            Name = name;
            Extension = extension;
        }
    }

    public class FileManager
    {
        protected static FileManager instance;
        public static FileManager Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = new FileManager();
                }
                return instance;
            }
        }

        public static readonly FileInfo DefaultFile = new FileInfo(".", "stammbaum", FileExtension.XML);

        public FileInfo CurrentFile;

        public FileManager()
        {
            CurrentFile = DefaultFile;
        }

        public bool EnsureExistanceCurrentFile()
        {
            return EnsureExistanceInternal(CurrentFile);
        }

        public bool EnsureExistanceDefaultFile()
        {
            return EnsureExistanceInternal(DefaultFile);
        }

        public bool EnsureExistance(FileInfo file)
        {
            return EnsureExistanceInternal(file);
        }

        protected bool EnsureExistanceInternal(FileInfo file)
        {
            string filePath = file.FilePath;
            try
            {
                Directory.CreateDirectory(file.Path);
                if (!File.Exists(filePath))
                {
                    File.Create(filePath);
                }
            }
            catch (Exception e)
            {
                Log.Write(e);
                return false;
            }
            return true;
        }

        public bool Read(ref string outContent)
        {
            return ReadInternal(ref outContent, CurrentFile);
        }

        public bool Read(ref string outContent, FileInfo file)
        {
            return ReadInternal(ref outContent, file);
        }

        protected bool ReadInternal(ref string outContent, FileInfo file)
        {
            if (!EnsureExistanceInternal(file))
            {
                return false;
            }
            try
            {
                outContent = File.ReadAllText(file.FilePath);
            }
            catch(Exception e)
            {
                Log.Write(e);
                return false;
            }
            return true;
        }


        public bool Write(string content)
        {
            return WriteInternal(content, CurrentFile);
        }

        public bool Write(string content, FileInfo file)
        {
            return WriteInternal(content, file);
        }

        protected bool WriteInternal(string content, FileInfo file)
        {
            if (!EnsureExistanceInternal(file))
            {
                return false;
            }
            try
            {
                File.WriteAllText(file.FilePath, content);
            }
            catch (Exception e)
            {
                Log.Write(e);
                return false;
            }
            return true;
        }
    }
}
