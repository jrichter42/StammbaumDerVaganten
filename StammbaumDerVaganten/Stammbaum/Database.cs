using System.Collections.Generic;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Data
    {
        #region Serialization
        [DataMember]
        public List<Scout> _SCOUTS
        {
            get { return Scouts; }
            set { Scouts = value; }
        }
        [DataMember]
        public List<Group> _GROUPS
        {
            get { return Groups; }
            set { Groups = value; }
        }
        [DataMember]
        public List<Role> _ROLES
        {
            get { return Roles; }
            set { Roles = value; }
        }
        [DataMember]
        public List<Timepoint> _TIMEPOINTS
        {
            get { return Timepoints; }
            set { Timepoints = value; }
        }
        #endregion

        public List<Scout> Scouts;
        public List<Group> Groups;
        public List<Role> Roles;
        public List<Timepoint> Timepoints;

        public Data()
        {
            Scouts = new List<Scout>();
            Groups = new List<Group>();
            Roles = new List<Role>();
            Timepoints = new List<Timepoint>();
        }

        #region GetStuffByID
        public Group GetGroupByID(int groupID)
        {
            if (groupID == Group.ID_INVALID)
            {
                return null;
            }

            foreach (Group g in Groups)
            {
                if (g.ID == groupID)
                {
                    return g;
                }
            }

            return null;
        }

        public Role GetRoleByID(int roleID)
        {
            if (roleID == Role.ID_INVALID)
            {
                return null;
            }

            foreach (Role r in Roles)
            {
                if (r.ID == roleID)
                {
                    return r;
                }
            }

            return null;
        }

        public Timepoint GetTimepointyID(int timepointID)
        {
            if (timepointID == Timepoint.ID_INVALID)
            {
                return null;
            }

            foreach (Timepoint t in Timepoints)
            {
                if (t.ID == timepointID)
                {
                    return t;
                }
            }

            return null;
        }
        #endregion
    }

    public class Database
    {
        public Data Data;

        public Dictionary<int, Group> GroupIDMap;
        public Dictionary<int, Role> RoleIDMap;
        public Dictionary<int, Timepoint> TimepointIDMap;

        public Database()
        {
            Data = new Data();
        }

        public bool Load()
        {
            string dataStr = "";
            if (FileManager.Instance.Read(ref dataStr))
            {
                if (Serializer<Data>.Deserialize(dataStr, ref Data))
                {
                    return true;
                }
            }
            return false;
        }
            
        public bool Save(bool humanReadable = true)
        {
            string dataStr = "";
            if (Serializer<Data>.Serialize(ref dataStr, Data, humanReadable))
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
