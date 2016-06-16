using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace StammbaumDerVaganten
{
    public class Serializer
    {
        protected static JavaScriptSerializer _serializer;
        protected static JavaScriptSerializer serializer
        {
            get
            {
                if (_serializer == null)
                {
                    _serializer = new JavaScriptSerializer();
                }
                return _serializer;
            }
        }

        public static bool Serialize<T>(ref string outData, T obj, bool humanReadable = false)
        {
            try
            {
                string result = serializer.Serialize(obj);
                if (result == null)
                {
                    return false;
                }
                if (humanReadable)
                {
                    outData = FormatOutput(result);
                }
            }
            catch (Exception e)
            {
                Log.Write(e);
                return false;
            }
            return true;
        }

        public static bool Deserialize<T>(string data, ref T outObj)
        {
            try
            {
                T result = serializer.Deserialize<T> (data);
                if (result == null)
                {
                    return false;
                }
                outObj = result;
            }
            catch (Exception e)
            {
                Log.Write(e);
                return false;
            }
            return true;
        }

        public static string FormatOutput(string jsonString)
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
