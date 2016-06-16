using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

        public Dictionary<int, Group> GroupIDMap;
        public Dictionary<int, Role> RoleIDMap;

        public Database()
        {
            Data = new Data();

            Group group = new Group(true);
            group.Type = GroupType_Type.Sippe;
            group.Name = "Phönix";
            Data.Groups.Add(group);

            Role role = new Role(true);
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

        public bool Load()
        {
            string dataStr = "";
            if (FileManager.Instance.Read(ref dataStr))
            {
                if (Serializer.Deserialize<Data>(dataStr, ref Data))
                {
                    return true;
                }
            }
            return false;
        }

        public bool Save(bool humanReadable = true)
        {
            string dataStr = "";
            if (Serializer.Serialize<Data>(ref dataStr, Data, humanReadable))
            {
                if (FileManager.Instance.Write(dataStr))
                {
                    return true;
                }
            }
            return false;
        }
    }
}
