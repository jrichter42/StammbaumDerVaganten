using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace StammbaumDerVaganten
{
    public class Data
    {
        public List<Scout> Scouts;
        public List<Group> Groups;
        public List<Role> Roles;

        public Data()
        {
            Scouts = new List<Scout>();
            Groups = new List<Group>();
            Roles = new List<Role>();
        }
    }

    public class Database
    {
        public Data Data;

        protected JavaScriptSerializer serializer;

        public Database()
        {
            Data = new Data();
            serializer = new JavaScriptSerializer();

            Group group = new Group();
            group.Type = GroupType_Type.Sippe;
            group.Name = "Phönix";
            Data.Groups.Add(group);

            Role role = new Role();
            role.Type = RoleType_Type.Sippenfuehrung;
            role.GroupType = GroupType_Type.Sippe;
            Data.Roles.Add(role);

            Scout scout = new Scout();
            scout.Forename = "Bob";
            scout.Lastname = "Baumeister";
            scout.Scoutname = "der";
            scout.Comment = "Jo, der schafft das!";
            scout.ContactInfo = "bob@baumeister.de";
            scout.Birthdate.Set(1985, 10, 14);
            
            Membership ms = new Membership();
            ms.Timespan.Start.Value.AddYears(2006);
            ms.Timespan.Start.YearDefined = true;
            ms.Group = group;

            scout.Memberships.Add(ms);

            Activity a = new Activity();
            a.Timespan.Start.Value.AddYears(2006);
            a.Timespan.Start.YearDefined = true;
            a.Group = group;
            a.Role = role;

            scout.Activities.Add(a);
            //for (int i = 0; i < 100; i++)
            Data.Scouts.Add(scout);
        }

        public bool Serialize(ref string outData)
        {
            try
            {
                string result = serializer.Serialize(Data);
                if (result == null)
                {
                    return false;
                }
                outData = FormatOutput(result);
                //outData = outData.Replace("\r\n", "\n");
            }
            catch (Exception)
            {
                return false;
            }
            return true;
        }

        public bool Deserialize(string data)
        {
            try
            {
                Data result = serializer.Deserialize<Data>(data);
                if (result == null)
                {
                    return false;
                }
                Data = result;
            }
            catch (Exception)
            {
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
