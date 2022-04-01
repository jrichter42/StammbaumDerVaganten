using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization;
using System.IO;
//using System.Runtime.Serialization.Json;

namespace StammbaumDerVaganten
{
    public class Serializer<T>
    {
        protected static /*DataContractJsonSerializer*/DataContractSerializer _serializer;
        protected static /*DataContractJsonSerializer*/DataContractSerializer serializer
        {
            get
            {
                if (_serializer is null)
                {
                    _serializer = new /*DataContractJsonSerializer*/DataContractSerializer (typeof(T),
                        /**/new List<Type>() { typeof(string) }
                        );
                }
                return _serializer;
            }
        }

        public static bool Serialize(ref string outData, T obj, bool humanReadable = false)
        {
            try
            {
                MemoryStream memoryStream = new MemoryStream();
                serializer.WriteObject(memoryStream, obj);
                memoryStream.Seek(0, SeekOrigin.Begin);
                StreamReader streamReader = new StreamReader(memoryStream);
                string result = streamReader.ReadToEnd();

                if (result is null)
                {
                    return false;
                }
                outData = result;
                if (humanReadable)
                {
                    //outData = FormatOutput(result);
                }
            }
            catch (Exception e)
            {
                Log.Global.Write(e);
                return false;
            }
            return true;
        }

        public static bool Deserialize(string data, ref T outObj)
        {
            if (data.Length == 0)
            {
                Log.Global.Write(Log_Level.Warning, "Data string of length 0 passed to Deserialize");
                return false;
            }

            try
            {
                MemoryStream memoryStream = new MemoryStream(Encoding.UTF8.GetBytes(data));
                T result = (T)serializer.ReadObject(memoryStream);

                if (result is null)
                {
                    return false;
                }
                outObj = result;
            }
            catch (Exception e)
            {
                Log.Global.Write(e);
                return false;
            }
            return true;
        }

        public static string FormatJSONOutput(string jsonString)
        {
            var stringBuilder = new StringBuilder();

            bool escaping = false;
            bool inQuotes = false;
            int indentation = 0;

            foreach (char character in jsonString)
            {
                if (escaping)
                {
                    escaping = false;
                    stringBuilder.Append(character);
                }
                else
                {
                    if (character == '\\')
                    {
                        escaping = true;
                        stringBuilder.Append(character);
                    }
                    else if (character == '\"')
                    {
                        inQuotes = !inQuotes;
                        stringBuilder.Append(character);
                    }
                    else if (!inQuotes)
                    {
                        if (character == ',')
                        {
                            stringBuilder.Append(character);
                            stringBuilder.Append("\r\n");
                            stringBuilder.Append('\t', indentation);
                        }
                        else if (character == '[' || character == '{')
                        {
                            stringBuilder.Append("\r\n");
                            stringBuilder.Append('\t', indentation);
                            stringBuilder.Append(character);
                            stringBuilder.Append("\r\n");
                            stringBuilder.Append('\t', ++indentation);
                        }
                        else if (character == ']' || character == '}')
                        {
                            stringBuilder.Append("\r\n");
                            stringBuilder.Append('\t', --indentation);
                            stringBuilder.Append(character);
                        }
                        else if (character == ':')
                        {
                            stringBuilder.Append(character);
                            stringBuilder.Append(' ');
                        }
                        else
                        {
                            stringBuilder.Append(character);
                        }
                    }
                    else
                    {
                        stringBuilder.Append(character);
                    }
                }
            }

            return stringBuilder.ToString();
        }
    }
}
